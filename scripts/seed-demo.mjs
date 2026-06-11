import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

const DEMO_SLUG = "sentiq-demo";
const DEMO_MARKER = "cor-75-demo";
const TOKEN_BYTE_LENGTH = 32;

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "DEMO_RESTAURANT_ADMIN_EMAIL",
  "DEMO_RESTAURANT_ADMIN_PASSWORD",
  "DEMO_MANAGER_EMAIL",
  "DEMO_MANAGER_PASSWORD",
];

loadEnvFile(".env");
loadEnvFile(".env.local");

let env;
let supabase;

async function main() {
  env = readEnv();
  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  validateDemoEmail(env.DEMO_RESTAURANT_ADMIN_EMAIL, "DEMO_RESTAURANT_ADMIN_EMAIL");
  validateDemoEmail(env.DEMO_MANAGER_EMAIL, "DEMO_MANAGER_EMAIL");

  if (env.DEMO_PLATFORM_ADMIN_EMAIL) {
    validateDemoEmail(env.DEMO_PLATFORM_ADMIN_EMAIL, "DEMO_PLATFORM_ADMIN_EMAIL");
  }

  const adminUser = await ensureAuthUser({
    email: env.DEMO_RESTAURANT_ADMIN_EMAIL,
    password: env.DEMO_RESTAURANT_ADMIN_PASSWORD,
    fullName: "Admin Demo SentiQ",
  });

  const managerUser = await ensureAuthUser({
    email: env.DEMO_MANAGER_EMAIL,
    password: env.DEMO_MANAGER_PASSWORD,
    fullName: "Gerente Demo Centro",
  });

  const platformUser = env.DEMO_PLATFORM_ADMIN_EMAIL && env.DEMO_PLATFORM_ADMIN_PASSWORD
    ? await ensureAuthUser({
      email: env.DEMO_PLATFORM_ADMIN_EMAIL,
      password: env.DEMO_PLATFORM_ADMIN_PASSWORD,
      fullName: "Platform Admin Demo",
    })
    : null;

  const restaurant = await ensureRestaurant();
  await ensureRestaurantAccount(restaurant.id);
  await ensureRestaurantSettings(restaurant.id);

  const branchCentro = await ensureBranch(restaurant.id, {
    name: "Centro",
    slug: "centro",
    address: "Av. Demo 100, Centro",
    internal_phone: "5550001000",
    notes: "Sucursal demo principal",
  });

  const branchNorte = await ensureBranch(restaurant.id, {
    name: "Norte",
    slug: "norte",
    address: "Av. Demo Norte 200",
    internal_phone: "5550002000",
    notes: "Sucursal demo secundaria",
  });

  const zoneSalon = await ensureZone(restaurant.id, branchCentro.id, "Salon principal");
  const zoneTerraza = await ensureZone(restaurant.id, branchCentro.id, "Terraza");
  await ensureZone(restaurant.id, branchNorte.id, "Comedor norte");

  await ensureProfile({
    id: adminUser.id,
    restaurantId: restaurant.id,
    fullName: "Admin Demo SentiQ",
    email: env.DEMO_RESTAURANT_ADMIN_EMAIL,
    role: "restaurant_admin",
    createdBy: platformUser?.id ?? adminUser.id,
  });

  await ensureProfile({
    id: managerUser.id,
    restaurantId: restaurant.id,
    fullName: "Gerente Demo Centro",
    email: env.DEMO_MANAGER_EMAIL,
    role: "manager",
    createdBy: adminUser.id,
  });

  if (platformUser) {
    await ensureProfile({
      id: platformUser.id,
      restaurantId: null,
      fullName: "Platform Admin Demo",
      email: env.DEMO_PLATFORM_ADMIN_EMAIL,
      role: "platform_admin",
      createdBy: null,
    });
  }

  await ensureManagerAssignment({
    restaurantId: restaurant.id,
    managerUserId: managerUser.id,
    branchId: branchCentro.id,
    createdBy: adminUser.id,
  });

  const waiterAna = await ensureWaiter(restaurant.id, branchCentro.id, "Ana Demo", "ANA-DEMO");
  await ensureWaiter(restaurant.id, branchCentro.id, "Luis Demo", "LUIS-DEMO");

  const device = await ensureDevice({
    restaurantId: restaurant.id,
    branchId: branchCentro.id,
    zoneId: zoneSalon.id,
    name: "Tablet Demo Centro",
    description: "Dispositivo demo para captura en sucursal Centro",
  });

  const qrSecret = createPublicTokenSecret();
  const qrLink = await ensureSurveyLink({
    restaurantId: restaurant.id,
    branchId: branchCentro.id,
    zoneId: null,
    deviceId: null,
    type: "qr",
    name: "QR Demo Centro",
    createdBy: adminUser.id,
    tokenSecret: qrSecret,
  });

  const deviceSecret = createPublicTokenSecret();
  const deviceLink = await ensureSurveyLink({
    restaurantId: restaurant.id,
    branchId: branchCentro.id,
    zoneId: zoneSalon.id,
    deviceId: device.id,
    type: "device",
    name: "Dispositivo Demo Centro",
    createdBy: adminUser.id,
    tokenSecret: deviceSecret,
  });

  const positiveResponse = await ensureFeedbackResponse({
    key: "positive-qr",
    restaurantId: restaurant.id,
    branchId: branchCentro.id,
    zoneId: null,
    deviceId: null,
    surveyLinkId: qrLink.id,
    waiterId: waiterAna.id,
    source: "qr",
    generalExperience: 5,
    serviceAttention: 5,
    foodQuality: 4,
    serviceSpeed: 5,
    comment: "Excelente servicio demo.",
    customerPhone: null,
    consentToContact: false,
    consentTextSnapshot: null,
    hasAlert: false,
  });

  const pendingAlertResponse = await ensureFeedbackResponse({
    key: "negative-qr-pending",
    restaurantId: restaurant.id,
    branchId: branchCentro.id,
    zoneId: zoneTerraza.id,
    deviceId: null,
    surveyLinkId: qrLink.id,
    waiterId: null,
    source: "qr",
    generalExperience: 2,
    serviceAttention: 2,
    foodQuality: 3,
    serviceSpeed: 2,
    comment: "La espera fue larga en esta respuesta demo.",
    customerPhone: "5551234567",
    consentToContact: true,
    consentTextSnapshot: "Acepto que el restaurante me contacte para dar seguimiento a mi experiencia.",
    hasAlert: true,
  });

  const attendedAlertResponse = await ensureFeedbackResponse({
    key: "negative-device-attended",
    restaurantId: restaurant.id,
    branchId: branchCentro.id,
    zoneId: zoneSalon.id,
    deviceId: device.id,
    surveyLinkId: deviceLink.id,
    waiterId: null,
    source: "device",
    generalExperience: 3,
    serviceAttention: 3,
    foodQuality: 3,
    serviceSpeed: 2,
    comment: "Respuesta demo desde dispositivo con alerta atendida.",
    customerPhone: null,
    consentToContact: false,
    consentTextSnapshot: null,
    hasAlert: true,
  });

  await ensureFeedbackAlert({
    response: pendingAlertResponse,
    status: "pending",
    attendedBy: null,
    internalNote: null,
  });

  await ensureFeedbackAlert({
    response: attendedAlertResponse,
    status: "attended",
    attendedBy: adminUser.id,
    internalNote: "Alerta demo marcada como atendida.",
  });

  console.log("");
  console.log("Demo data ready.");
  console.log("");
  console.log("Demo credentials");
  console.log(`- Restaurant admin: ${env.DEMO_RESTAURANT_ADMIN_EMAIL} / ${env.DEMO_RESTAURANT_ADMIN_PASSWORD}`);
  console.log(`- Manager: ${env.DEMO_MANAGER_EMAIL} / ${env.DEMO_MANAGER_PASSWORD}`);
  if (platformUser) {
    console.log(`- Platform admin: ${env.DEMO_PLATFORM_ADMIN_EMAIL} / ${env.DEMO_PLATFORM_ADMIN_PASSWORD}`);
  }
  console.log("");
  console.log("Public capture URLs");
  console.log(`- QR: ${buildCaptureUrl("s", qrSecret.token)}`);
  console.log(`- Device: ${buildCaptureUrl("d", deviceSecret.token)}`);
  console.log("");
  console.log("Useful IDs");
  console.log(`- restaurant_id: ${restaurant.id}`);
  console.log(`- branch_centro_id: ${branchCentro.id}`);
  console.log(`- branch_norte_id: ${branchNorte.id}`);
  console.log(`- device_id: ${device.id}`);
  console.log(`- qr_link_id: ${qrLink.id}`);
  console.log(`- device_link_id: ${deviceLink.id}`);
  console.log(`- positive_response_id: ${positiveResponse.id}`);
}

function readEnv() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    SUPABASE_URL: process.env.SUPABASE_URL.trim(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL.trim(),
    DEMO_RESTAURANT_ADMIN_EMAIL: process.env.DEMO_RESTAURANT_ADMIN_EMAIL.trim(),
    DEMO_RESTAURANT_ADMIN_PASSWORD: process.env.DEMO_RESTAURANT_ADMIN_PASSWORD.trim(),
    DEMO_MANAGER_EMAIL: process.env.DEMO_MANAGER_EMAIL.trim(),
    DEMO_MANAGER_PASSWORD: process.env.DEMO_MANAGER_PASSWORD.trim(),
    DEMO_PLATFORM_ADMIN_EMAIL: process.env.DEMO_PLATFORM_ADMIN_EMAIL?.trim() || "",
    DEMO_PLATFORM_ADMIN_PASSWORD: process.env.DEMO_PLATFORM_ADMIN_PASSWORD?.trim() || "",
  };
}

function validateDemoEmail(email, envName) {
  if (!email.includes("@")) {
    throw new Error(`${envName} must be an email address.`);
  }

  const localPart = email.split("@")[0].toLowerCase();
  const domain = email.split("@")[1].toLowerCase();
  const hasDemoMarker = ["demo", "test", "dev", "sentiq"].some((marker) =>
    localPart.includes(marker) || domain.includes(marker)
  );

  if (!hasDemoMarker) {
    throw new Error(`${envName} must look like a demo/dev address. Include demo, test, dev, or sentiq in the email.`);
  }
}

async function ensureAuthUser({ email, password, fullName }) {
  const existingUser = await findAuthUserByEmail(email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, demo_seed: DEMO_MARKER },
    });
    throwIf(error, `update auth user ${email}`);
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, demo_seed: DEMO_MARKER },
  });
  throwIf(error, `create auth user ${email}`);
  return data.user;
}

async function findAuthUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    throwIf(error, "list auth users");

    const found = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page += 1;
  }

  throw new Error("Too many Auth users to scan safely. Use a smaller development project.");
}

async function ensureRestaurant() {
  const existing = await maybeSingle(
    supabase.from("restaurants").select("*").eq("slug", DEMO_SLUG),
    "find demo restaurant",
  );

  const payload = {
    name: "SentiQ Demo Restaurante",
    legal_name: "SentiQ Demo S.A. de C.V.",
    slug: DEMO_SLUG,
    contact_name: "Contacto Demo",
    contact_email: env.DEMO_RESTAURANT_ADMIN_EMAIL,
    contact_phone: "5550000000",
    status: "active",
    updated_at: nowIso(),
  };

  if (existing) {
    return updateById("restaurants", existing.id, payload);
  }

  return insertOne("restaurants", payload, "create demo restaurant");
}

async function ensureRestaurantAccount(restaurantId) {
  const existing = await maybeSingle(
    supabase.from("restaurant_accounts").select("*").eq("restaurant_id", restaurantId),
    "find demo restaurant account",
  );

  const payload = {
    restaurant_id: restaurantId,
    plan_code: "demo",
    account_status: "active",
    implementation_fee_mxn: 0,
    monthly_fee_mxn: 0,
    notes: "Cuenta demo creada por COR-75.",
    started_at: nowIso(),
    cancelled_at: null,
    updated_at: nowIso(),
  };

  return existing
    ? updateById("restaurant_accounts", existing.id, payload)
    : insertOne("restaurant_accounts", payload, "create demo restaurant account");
}

async function ensureRestaurantSettings(restaurantId) {
  const existing = await maybeSingle(
    supabase.from("restaurant_settings").select("*").eq("restaurant_id", restaurantId),
    "find demo restaurant settings",
  );

  const payload = {
    restaurant_id: restaurantId,
    logo_url: null,
    logo_storage_path: null,
    primary_color: "#0f766e",
    secondary_color: "#f97316",
    survey_welcome_text: "Gracias por visitarnos. Tu opinion nos ayuda a mejorar cada dia.",
    survey_thank_you_text: "Gracias por compartir tu opinion.",
    question_general_text: "Como calificarias tu experiencia general?",
    question_attention_text: "Como calificarias la atencion recibida?",
    question_food_text: "Como calificarias la calidad de alimentos y bebidas?",
    question_speed_text: "Como calificarias la rapidez del servicio?",
    contact_consent_text: "Acepto que el restaurante me contacte para dar seguimiento a mi experiencia.",
    updated_at: nowIso(),
  };

  return existing
    ? updateById("restaurant_settings", existing.id, payload)
    : insertOne("restaurant_settings", payload, "create demo restaurant settings");
}

async function ensureBranch(restaurantId, input) {
  const existing = await maybeSingle(
    supabase
      .from("branches")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("slug", input.slug),
    `find demo branch ${input.slug}`,
  );

  const payload = {
    restaurant_id: restaurantId,
    name: input.name,
    slug: input.slug,
    address: input.address,
    internal_phone: input.internal_phone,
    notes: input.notes,
    status: "active",
    updated_at: nowIso(),
  };

  return existing
    ? updateById("branches", existing.id, payload)
    : insertOne("branches", payload, `create demo branch ${input.slug}`);
}

async function ensureZone(restaurantId, branchId, name) {
  const existing = await maybeSingle(
    supabase
      .from("zones")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("branch_id", branchId)
      .eq("name", name),
    `find demo zone ${name}`,
  );

  const payload = {
    restaurant_id: restaurantId,
    branch_id: branchId,
    name,
    status: "active",
    updated_at: nowIso(),
  };

  return existing
    ? updateById("zones", existing.id, payload)
    : insertOne("zones", payload, `create demo zone ${name}`);
}

async function ensureProfile({ id, restaurantId, fullName, email, role, createdBy }) {
  const existing = await maybeSingle(
    supabase.from("user_profiles").select("*").eq("id", id),
    `find profile ${email}`,
  );

  const payload = {
    id,
    restaurant_id: restaurantId,
    full_name: fullName,
    email,
    role,
    status: "active",
    created_by: createdBy,
    updated_at: nowIso(),
  };

  return existing
    ? updateById("user_profiles", existing.id, payload)
    : insertOne("user_profiles", payload, `create profile ${email}`);
}

async function ensureManagerAssignment({ restaurantId, managerUserId, branchId, createdBy }) {
  const existing = await maybeSingle(
    supabase
      .from("manager_branch_assignments")
      .select("*")
      .eq("manager_user_id", managerUserId)
      .eq("branch_id", branchId),
    "find demo manager assignment",
  );

  const payload = {
    restaurant_id: restaurantId,
    manager_user_id: managerUserId,
    branch_id: branchId,
    status: "active",
    created_by: createdBy,
  };

  return existing
    ? updateById("manager_branch_assignments", existing.id, payload)
    : insertOne("manager_branch_assignments", payload, "create demo manager assignment");
}

async function ensureWaiter(restaurantId, branchId, name, internalCode) {
  const existing = await maybeSingle(
    supabase
      .from("waiters")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("branch_id", branchId)
      .eq("internal_code", internalCode),
    `find demo waiter ${internalCode}`,
  );

  const payload = {
    restaurant_id: restaurantId,
    branch_id: branchId,
    name,
    internal_code: internalCode,
    status: "active",
    updated_at: nowIso(),
  };

  return existing
    ? updateById("waiters", existing.id, payload)
    : insertOne("waiters", payload, `create demo waiter ${internalCode}`);
}

async function ensureDevice({ restaurantId, branchId, zoneId, name, description }) {
  const existing = await maybeSingle(
    supabase
      .from("devices")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("branch_id", branchId)
      .eq("name", name),
    "find demo device",
  );

  const payload = {
    restaurant_id: restaurantId,
    branch_id: branchId,
    zone_id: zoneId,
    name,
    description,
    status: "active",
    updated_at: nowIso(),
  };

  return existing
    ? updateById("devices", existing.id, payload)
    : insertOne("devices", payload, "create demo device");
}

async function ensureSurveyLink({
  restaurantId,
  branchId,
  zoneId,
  deviceId,
  type,
  name,
  createdBy,
  tokenSecret,
}) {
  let query = supabase
    .from("survey_links")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("branch_id", branchId)
    .eq("type", type);

  query = type === "device" ? query.eq("device_id", deviceId) : query.is("device_id", null);

  const existing = await maybeSingle(query.limit(1), `find demo ${type} survey link`);

  const payload = {
    restaurant_id: restaurantId,
    branch_id: branchId,
    zone_id: zoneId,
    device_id: deviceId,
    type,
    name,
    token_hash: tokenSecret.tokenHash,
    token_last4: tokenSecret.tokenLast4,
    status: "active",
    created_by: createdBy,
    regenerated_at: nowIso(),
    revoked_at: null,
    updated_at: nowIso(),
  };

  return existing
    ? updateById("survey_links", existing.id, payload)
    : insertOne("survey_links", payload, `create demo ${type} survey link`);
}

async function ensureFeedbackResponse(input) {
  const metadata = { demo_seed: DEMO_MARKER, demo_key: input.key };
  const existing = await maybeSingle(
    supabase
      .from("feedback_responses")
      .select("*")
      .contains("metadata", metadata),
    `find demo feedback response ${input.key}`,
  );

  const payload = {
    restaurant_id: input.restaurantId,
    branch_id: input.branchId,
    zone_id: input.zoneId,
    device_id: input.deviceId,
    survey_link_id: input.surveyLinkId,
    waiter_id: input.waiterId,
    source: input.source,
    general_experience: input.generalExperience,
    service_attention: input.serviceAttention,
    food_quality: input.foodQuality,
    service_speed: input.serviceSpeed,
    comment: input.comment,
    customer_phone: input.customerPhone,
    consent_to_contact: input.consentToContact,
    consent_text_snapshot: input.consentTextSnapshot,
    has_alert: input.hasAlert,
    metadata,
  };

  return existing
    ? updateById("feedback_responses", existing.id, payload)
    : insertOne("feedback_responses", payload, `create demo feedback response ${input.key}`);
}

async function ensureFeedbackAlert({ response, status, attendedBy, internalNote }) {
  const existing = await maybeSingle(
    supabase.from("feedback_alerts").select("*").eq("response_id", response.id),
    `find demo alert ${response.id}`,
  );

  const payload = {
    restaurant_id: response.restaurant_id,
    branch_id: response.branch_id,
    zone_id: response.zone_id,
    device_id: response.device_id,
    response_id: response.id,
    source: response.source,
    general_experience: response.general_experience,
    status,
    attended_by: status === "attended" ? attendedBy : null,
    attended_at: status === "attended" ? nowIso() : null,
    internal_note: internalNote,
    updated_at: nowIso(),
  };

  return existing
    ? updateById("feedback_alerts", existing.id, payload)
    : insertOne("feedback_alerts", payload, `create demo alert ${response.id}`);
}

async function maybeSingle(query, label) {
  const { data, error } = await query.maybeSingle();
  throwIf(error, label);
  return data;
}

async function insertOne(table, payload, label) {
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  throwIf(error, label);
  return data;
}

async function updateById(table, id, payload) {
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select("*").single();
  throwIf(error, `update ${table} ${id}`);
  return data;
}

function createPublicTokenSecret() {
  const token = randomBytes(TOKEN_BYTE_LENGTH).toString("base64url");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    tokenLast4: token.slice(-4),
  };
}

function buildCaptureUrl(path, token) {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  return `${baseUrl}/${path}/${encodeURIComponent(token)}`;
}

function throwIf(error, label) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const contents = readFileSync(path, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
