/* Perimeter Zero · Zero Trust extension of the Architect's Desk engine:
   components, region-aware cost lines, the Zero Trust review (CISA ZTMM v2 pillars, NIST SP 800-207 tenets)
   and Zero Trust templates. Loaded after catalog/cost/analysis/templates/terraform, before app.js. */
(function () {
  "use strict";
  const G = AD.GLYPHS, C = AD.CATALOG;

  // ---------- original glyphs (24x24, stroke = currentColor) ----------
  Object.assign(G, {
    idc: '<circle cx="12" cy="8" r="3.2"/><path d="M6 19.5c.7-3.6 3-5.5 6-5.5s5.3 1.9 6 5.5"/><path d="M3.5 6.5V4h2.5M20.5 6.5V4H18M3.5 17.5V20h2.5M20.5 17.5V20H18"/>',
    idp: '<circle cx="8.5" cy="9" r="2.8"/><path d="M3.5 18c.5-3 2.4-4.6 5-4.6s4.5 1.6 5 4.6"/><path d="M14.5 7.5h6M14.5 11h6M17.5 14.5h3"/><path d="M15 17.5l1.4 1.4 3-3"/>',
    cognito: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><circle cx="12" cy="10" r="2.6"/><path d="M7.5 17c.6-2.2 2.3-3.4 4.5-3.4s3.9 1.2 4.5 3.4"/>',
    iam: '<path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z"/><circle cx="12" cy="10" r="2"/><path d="M12 12v4M12 14.5h1.8"/>',
    posture: '<rect x="3.5" y="5" width="13" height="9" rx="1.5"/><path d="M7 18h6M10 14v4"/><path d="M15.5 12.5l3.5-1.5 3 1.3v2.6c0 2.2-1.3 3.8-3 4.6-1.7-.8-3.5-2.4-3.5-4.6z"/>',
    va: '<path d="M4 12h3.5"/><rect x="7.5" y="6" width="5" height="12" rx="2.5"/><path d="M12.5 12h3"/><path d="M15.5 9l3.5-3M15.5 15l3.5 3M15.5 12h5"/><circle cx="10" cy="12" r="1"/>',
    vpce: '<rect x="3.5" y="6.5" width="7" height="11" rx="1.5"/><path d="M10.5 12h4"/><circle cx="17.5" cy="12" r="3"/><path d="M6 10h2M6 14h2"/>',
    gwep: '<path d="M4 18V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9"/><path d="M8 18v-6h8v6"/><path d="M3 18h18"/>',
    lattice: '<circle cx="5.5" cy="6" r="2"/><circle cx="18.5" cy="6" r="2"/><circle cx="5.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/><rect x="9" y="9" width="6" height="6" rx="1.5"/><path d="M7 7.5l2 2M17 7.5l-2 2M7 16.5l2-2M17 16.5l-2-2"/>',
    tgw: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v5.8M12 15.2V21M3 12h5.8M15.2 12H21"/><circle cx="12" cy="3" r=".9"/><circle cx="12" cy="21" r=".9"/><circle cx="3" cy="12" r=".9"/><circle cx="21" cy="12" r=".9"/>',
    nfw: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 9.7h17M3.5 14.3h17M9 5v4.7M15 5v4.7M6.5 9.7v4.6M12 9.7v4.6M17.5 9.7v4.6M9 14.3V19M15 14.3V19"/>',
    pca: '<rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M7.5 8h9M7.5 11h5"/><circle cx="16" cy="16" r="3"/><path d="M14.3 18.5L13.5 21l2.5-1 2.5 1-.8-2.5"/>',
    macie: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/><path d="M8 9h5M8 12h3.5"/>',
    guardduty: '<path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z"/><path d="M8.5 12.5c1-1.8 2.2-2.7 3.5-2.7s2.5.9 3.5 2.7c-1 1.8-2.2 2.7-3.5 2.7s-2.5-.9-3.5-2.7z"/><circle cx="12" cy="12.5" r="1"/>',
    sechub: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 15l2.5-3 2.5 2 3.5-5"/><path d="M8 8h3"/>',
    cloudtrail: '<path d="M4 18c2.5-4 5.5-9 8-9s3.5 3 8 3"/><circle cx="4" cy="18" r="1.4"/><circle cx="12" cy="9" r="1.4"/><circle cx="20" cy="12" r="1.4"/><path d="M4 5h6M4 8h3"/>',
    flowlogs: '<path d="M3 8h12M3 12h16M3 16h9"/><path d="M15 5l3 3-3 3M17 13l3 3-3 3"/>',
    config: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4L18 18M18 6l-1.6 1.6M7.6 16.4L6 18"/>',
    detective: '<circle cx="10" cy="10" r="5.5"/><path d="M14 14l6 6"/><path d="M7.5 10.5l1.8 1.8 3.2-3.6"/>',
    seclake: '<path d="M3 15c2 0 2-1.5 4.5-1.5S9.5 15 12 15s2-1.5 4.5-1.5S18.5 15 21 15M3 19c2 0 2-1.5 4.5-1.5S9.5 19 12 19s2-1.5 4.5-1.5S18.5 19 21 19"/><path d="M12 3l5 2v3c0 2.6-2 4.4-5 5.4-3-1-5-2.8-5-5.4V5z"/>',
    org: '<rect x="9" y="3.5" width="6" height="4.5" rx="1"/><rect x="3" y="16" width="6" height="4.5" rx="1"/><rect x="15" y="16" width="6" height="4.5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    account: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 8.5h17"/><circle cx="6" cy="6.5" r=".6"/><circle cx="8" cy="6.5" r=".6"/>'
  });

  // ---------- extend existing components with Zero Trust properties ----------
  const SG = { k: "sg", label: "Security group scope", type: "select", options: ["Tier SGs only", "Whole VPC CIDR", "0.0.0.0/0"], def: "Tier SGs only", hint: "Who may reach this tier" };
  ["ec2", "asg", "ecs", "eks", "rds", "aurora", "elasticache"].forEach((t) => C[t].props.push({ ...SG }));
  ["ec2", "asg", "ecs", "eks"].forEach((t) => C[t].props.push({ k: "mtls", label: "mTLS for service-to-service", type: "bool", def: false }));
  C.alb.props.push({ k: "https", label: "HTTPS listener (TLS)", type: "bool", def: true });
  ["rds", "aurora"].forEach((t) => C[t].props.push({ k: "tls", label: "Require TLS connections", type: "bool", def: true }));
  C.users.props.push({ k: "audience", label: "Who they are", type: "select", options: ["Workforce", "Customers"], def: "Workforce" });
  C.users.about = "Where traffic comes from. Workforce users are expected to come through identity- and device-aware access.";

  // ---------- new components ----------
  const num = (k, label, def, unit, extra) => Object.assign({ k, label, type: "num", def, min: 0 }, unit ? { unit } : {}, extra || {});
  const bool = (k, label, def) => ({ k, label, type: "bool", def });
  const sel = (k, label, options, def) => ({ k, label, type: "select", options, def });
  Object.assign(C, {
    idc: { name: "Identity Center", full: "AWS IAM Identity Center", cat: "identity", glyph: "idc", about: "Central workforce sign-in and permission sets for every account. AWS doesn't charge for IAM Identity Center.",
      props: [num("users", "Workforce users", 200), bool("mfa", "MFA required", true), bool("phish", "Phishing-resistant MFA (FIDO2 / passkeys)", false)] },
    idp: { name: "External IdP", full: "External identity provider (Okta / Microsoft Entra ID)", cat: "identity", glyph: "idp", about: "Placeholder for a third-party identity provider federated over SAML or OIDC. Licensed separately; not estimated.",
      props: [sel("vendor", "Provider", ["Okta", "Microsoft Entra ID", "Ping Identity", "Other OIDC / SAML"], "Okta"), bool("mfa", "MFA required", true), bool("phish", "Phishing-resistant MFA (FIDO2 / passkeys)", false)] },
    cognito: { name: "Cognito", full: "Amazon Cognito user pool", cat: "identity", glyph: "cognito", about: "Customer sign-in. Can sit on an ALB listener (authenticate-cognito action) or authorize API Gateway calls.",
      props: [num("mau", "Monthly active users", 20000, "MAU", { step: 1000 }), sel("tier", "Feature plan", ["Essentials", "Lite"], "Essentials"), bool("mfa", "MFA required", true)] },
    iam: { name: "IAM roles", full: "IAM roles and policies", cat: "identity", glyph: "iam", about: "Workload roles and their policies. No AWS charge.",
      props: [bool("wildcard", "Wildcard (*) actions or resources", false), bool("longKeys", "Long-lived access keys in use", false), bool("boundary", "Permissions boundaries", true)] },
    posture: { name: "Device posture", full: "Device posture provider (CrowdStrike / Jamf / Intune)", cat: "identity", glyph: "posture", about: "Placeholder for an EDR or endpoint manager that reports device health. Verified Access accepts CrowdStrike, Jamf and JumpCloud directly as device trust providers; Intune compliance usually reaches AWS through Entra ID claims. Licensed separately; not estimated.",
      props: [sel("vendor", "Provider", ["CrowdStrike", "Jamf", "JumpCloud", "Microsoft Intune"], "CrowdStrike"), num("managed", "Managed devices", 100, "%", { max: 100 })] },
    va: { name: "Verified Access", full: "AWS Verified Access", cat: "zt", glyph: "va", about: "Identity- and device-aware access to private applications without a VPN. Every request is evaluated against a Cedar policy.",
      props: [num("apps", "Applications (endpoints)", 2, null, { min: 1, max: 100 }), num("gb", "Data processed", 100, "GB/mo", { step: 10 }), bool("devicePolicy", "Policy checks device posture", true), bool("logging", "Access logging", true)] },
    vpce: { name: "Interface endpoints", full: "Interface VPC endpoints (AWS PrivateLink)", cat: "zt", glyph: "vpce", vpc: true, about: "Private connections to AWS APIs, so calls never cross the internet or a NAT gateway. One endpoint per service listed, one ENI per AZ.",
      props: [{ k: "services", label: "Services", type: "text", def: "sts, kms, secretsmanager, ssm, logs" }, sel("azs", "AZs per endpoint", [1, 2, 3], 2), num("gb", "Data processed", 50, "GB/mo", { step: 10 })] },
    gwep: { name: "Gateway endpoints", full: "S3 / DynamoDB gateway VPC endpoints", cat: "zt", glyph: "gwep", vpc: true, about: "Route-table targets for S3 and DynamoDB. No AWS charge.",
      props: [bool("s3", "Amazon S3", true), bool("ddb", "Amazon DynamoDB", true)] },
    lattice: { name: "VPC Lattice", full: "Amazon VPC Lattice service network", cat: "zt", glyph: "lattice", about: "Service-to-service connectivity with IAM-authenticated (SigV4) requests and per-service auth policies.",
      props: [num("services", "Services", 3, null, { min: 1, max: 200 }), num("gb", "Data processed", 100, "GB/mo", { step: 10 }), sel("auth", "Auth type", ["AWS_IAM", "NONE"], "AWS_IAM")] },
    tgw: { name: "Transit GW", full: "AWS Transit Gateway", cat: "zt", glyph: "tgw", props: [num("attach", "VPC attachments", 3, null, { min: 1, max: 100 }), num("gb", "Data processed", 200, "GB/mo", { step: 10 })] },
    nfw: { name: "Network Firewall", full: "AWS Network Firewall", cat: "zt", glyph: "nfw", vpc: true, about: "Stateful inspection and domain filtering for traffic leaving or crossing VPCs.",
      props: [num("endpoints", "Firewall endpoints (one per AZ)", 2, null, { min: 1, max: 6 }), num("gb", "Traffic processed", 200, "GB/mo", { step: 10 })] },
    pca: { name: "Private CA", full: "AWS Private CA (mTLS)", cat: "security", glyph: "pca", about: "Issues the private certificates used for mutual TLS between clients and services.",
      props: [sel("mode", "CA mode", ["Short-lived certificates", "General-purpose"], "Short-lived certificates"), num("certs", "Certificates issued", 500, "/mo", { step: 50 })] },
    macie: { name: "Macie", full: "Amazon Macie", cat: "security", glyph: "macie", about: "Discovers sensitive data in S3 and watches bucket security posture.", props: [num("buckets", "S3 buckets monitored", 10), num("gb", "Data scanned", 10, "GB/mo")] },
    guardduty: { name: "GuardDuty", full: "Amazon GuardDuty", cat: "security", glyph: "guardduty", props: [num("eventsM", "CloudTrail management events", 5, "M/mo"), num("logGb", "VPC Flow Log + DNS log data", 50, "GB/mo", { step: 10 }), num("s3M", "S3 data events", 0, "M/mo")] },
    sechub: { name: "Security Hub", full: "AWS Security Hub (CSPM checks)", cat: "security", glyph: "sechub", props: [num("checks", "Security checks", 3000, "/mo", { step: 500 }), num("findingsK", "Finding ingestion events", 5, "K/mo")] },
    cloudtrail: { name: "CloudTrail", full: "AWS CloudTrail", cat: "detect", glyph: "cloudtrail", about: "The first copy of management events in each region is delivered at no charge.",
      props: [bool("orgTrail", "Organization trail", true), bool("validation", "Log file integrity validation", true), num("paidM", "Extra copies of management events", 0, "M/mo"), num("dataM", "Data events", 5, "M/mo")] },
    flowlogs: { name: "VPC Flow Logs", full: "VPC Flow Logs", cat: "detect", glyph: "flowlogs", props: [num("gb", "Log data delivered", 50, "GB/mo", { step: 10 })] },
    config: { name: "AWS Config", full: "AWS Config", cat: "detect", glyph: "config", props: [num("items", "Configuration items recorded", 2000, "/mo", { step: 100 }), num("evalsK", "Rule evaluations", 20, "K/mo"), bool("conformance", "Conformance packs deployed", true), bool("remediation", "Automatic remediation", true)] },
    detective: { name: "Detective", full: "Amazon Detective", cat: "detect", glyph: "detective", props: [num("gb", "Data analyzed", 20, "GB/mo")] },
    seclake: { name: "Security Lake", full: "Amazon Security Lake", cat: "detect", glyph: "seclake", about: "Normalizes AWS security logs to OCSF in S3 (storage is billed by S3 separately).", props: [num("gb", "AWS log data normalized", 50, "GB/mo", { step: 10 })] },
    org: { name: "Organizations", full: "AWS Organizations + SCPs", cat: "security", glyph: "org", about: "Multi-account structure with service control policies as guardrails. No AWS charge.", props: [num("scps", "Service control policies", 3, null, { max: 50 })] },
    account: { name: "Account", full: "AWS account boundary", cat: "group", glyph: "account", container: 0.5, w: 320, h: 460, props: [sel("role", "Account role", ["workload", "security", "log-archive", "management"], "workload")] }
  });
  const ROLE_LABEL = { workload: "Workload account", security: "Security Tooling account", "log-archive": "Log Archive account", management: "Management account" };
  AD.ROLE_LABEL = ROLE_LABEL;
  AD.CATS = [["edge", "Edge & DNS"], ["identity", "Identity & devices"], ["zt", "Zero Trust access & network"], ["network", "Networking"], ["compute", "Compute"], ["data", "Data & storage"], ["integration", "Integration"], ["security", "Security & guardrails"], ["detect", "Detection & logging"], ["ops", "Operations"], ["group", "Groups & accounts"]];

  // ---------- cost (region-aware; a null price = not offered in this region) ----------
  const H = 730; const n = (v) => (isFinite(+v) ? +v : 0); const fmt = AD.fmtPrice;
  const perM = (v) => (v == null ? "n/a" : fmt(v * 1e6) + "/M");
  function mk(P) { const R = (P.meta && P.meta.region) || "this region"; return (label, qty, price, basis) => price == null ? { label, amount: 0, na: true, basis: "Not available in " + R } : { label, amount: Math.max(0, qty * price), basis }; }
  const ZC = {
    cognito: (p, P, L) => { const pr = p.tier === "Lite" ? P.cognitoLiteMau : P.cognitoEssMau; const b = Math.max(0, n(p.mau) - 10000);
      return [L(`MAUs (${p.tier})`, b, pr, `${n(p.mau).toLocaleString()} MAU − 10,000 free × ${fmt(pr)}/MAU (first tier)`)]; },
    va: (p, P, L) => [L("Application hours", n(p.apps) * H, P.vaAppHr, `${n(p.apps)} apps × 730 h × ${fmt(P.vaAppHr)}/h (first tier)`), L("Data processed", n(p.gb), P.vaGb, `${n(p.gb)} GB × ${fmt(P.vaGb)}/GB`)],
    vpce: (p, P, L) => { const k = String(p.services || "").split(/[\s,]+/).filter(Boolean).length; const a = n(p.azs) || 1;
      return [L(`${k} endpoints × ${a} AZ`, k * a * H, P.vpceHr, `${k} × ${a} ENIs × 730 h × ${fmt(P.vpceHr)}/h`), L("Data processed", n(p.gb), P.vpceGb, `${n(p.gb)} GB × ${fmt(P.vpceGb)}/GB (first 1 PB tier)`)]; },
    gwep: () => [],
    lattice: (p, P, L) => [L("Service hours", n(p.services) * H, P.latticeSvcHr, `${n(p.services)} services × 730 h × ${fmt(P.latticeSvcHr)}/h`), L("Data processed", n(p.gb), P.latticeGb, `${n(p.gb)} GB × ${fmt(P.latticeGb)}/GB (requests: first 300K/h free, not modeled)`)],
    tgw: (p, P, L) => [L("VPC attachment hours", n(p.attach) * H, P.tgwAttachHr, `${n(p.attach)} × 730 h × ${fmt(P.tgwAttachHr)}/h`), L("Data processed", n(p.gb), P.tgwGb, `${n(p.gb)} GB × ${fmt(P.tgwGb)}/GB`)],
    nfw: (p, P, L) => [L("Endpoint hours", n(p.endpoints) * H, P.nfwEndpointHr, `${n(p.endpoints)} × 730 h × ${fmt(P.nfwEndpointHr)}/h`), L("Traffic processed", n(p.gb), P.nfwGb, `${n(p.gb)} GB × ${fmt(P.nfwGb)}/GB`)],
    pca: (p, P, L) => p.mode === "General-purpose"
      ? [L("CA (general-purpose)", 1, P.pcaMo, `${fmt(P.pcaMo)}/CA-mo`), L("Certificates", n(p.certs), P.pcaCert, `${n(p.certs)} × ${fmt(P.pcaCert)} (first 1,000 tier)`)]
      : [L("CA (short-lived mode)", 1, P.pcaShortMo, `${fmt(P.pcaShortMo)}/CA-mo`), L("Short-lived certificates", n(p.certs), P.pcaShortCert, `${n(p.certs)} × ${fmt(P.pcaShortCert)}`)],
    macie: (p, P, L) => [L("Bucket inventory", n(p.buckets) * 30, P.macieBucketDay, `${n(p.buckets)} buckets × 30 days × ${fmt(P.macieBucketDay)}/bucket-day`), L("Sensitive data discovery", n(p.gb), P.macieGb, `${n(p.gb)} GB × ${fmt(P.macieGb)}/GB (first 1 GB free not deducted)`)],
    guardduty: (p, P, L) => [L("CloudTrail events analyzed", n(p.eventsM) * 1e6, P.gdEvent, `${n(p.eventsM)}M × ${perM(P.gdEvent)}`), L("Flow Log + DNS data", n(p.logGb), P.gdLogGb, `${n(p.logGb)} GB × ${fmt(P.gdLogGb)}/GB (first 500 GB tier)`), L("S3 data events", n(p.s3M) * 1e6, P.gdS3Event, `${n(p.s3M)}M × ${perM(P.gdS3Event)}`)],
    sechub: (p, P, L) => [L("Security checks", n(p.checks), P.shCheck, `${n(p.checks).toLocaleString()} × ${fmt(P.shCheck)} (first 100K tier)`), L("Finding ingestion", Math.max(0, n(p.findingsK) * 1000 - 10000), P.shFinding, `${n(p.findingsK)}K − 10K free × ${fmt(P.shFinding)}`)],
    cloudtrail: (p, P, L) => [L("First copy of management events", 0, 0, "Delivered at no charge"), L("Extra management event copies", n(p.paidM) * 1e6, P.ctPaidEvent, `${n(p.paidM)}M × ${perM(P.ctPaidEvent)}`), L("Data events", n(p.dataM) * 1e6, P.ctDataEvent, `${n(p.dataM)}M × ${perM(P.ctDataEvent)}`)],
    flowlogs: (p, P, L) => [L("Delivered to CloudWatch Logs", n(p.gb), P.vendedLogGb, `${n(p.gb)} GB × ${fmt(P.vendedLogGb)}/GB vended logs (first 10 TB tier)`)],
    config: (p, P, L) => [L("Configuration items", n(p.items), P.cfgItem, `${n(p.items).toLocaleString()} × ${fmt(P.cfgItem)}`), L("Rule evaluations", n(p.evalsK) * 1000, P.cfgEval, `${n(p.evalsK)}K × ${fmt(P.cfgEval)} (first 100K tier)`)],
    detective: (p, P, L) => [L("Data analyzed", n(p.gb), P.detGb, `${n(p.gb)} GB × ${fmt(P.detGb)}/GB (first 1,000 GB tier)`)],
    seclake: (p, P, L) => [L("Log normalization", n(p.gb), P.slNormGb, `${n(p.gb)} GB × ${fmt(P.slNormGb)}/GB (S3 storage not included)`)]
  };
  const baseCost = AD.cost;
  AD.cost = function (node, P) { const f = ZC[node.type]; return f ? f(node.props || {}, P, mk(P)) : baseCost(node, P); };

  // ---------- Zero Trust review ----------
  const ZP = [["id", "Identity"], ["dev", "Devices"], ["net", "Networks"], ["app", "Applications & Workloads"], ["data", "Data"], ["vis", "Visibility & Analytics"], ["auto", "Automation & Orchestration"], ["gov", "Governance"]];
  const STAGES = ["Traditional", "Initial", "Advanced", "Optimal"]; const PTS = [10, 40, 70, 100];
  const TENETS = {
    1: "All data sources and computing services are considered resources.",
    2: "All communication is secured regardless of network location.",
    3: "Access to individual enterprise resources is granted on a per-session basis.",
    4: "Access to resources is determined by dynamic policy, including the observable state of client identity, application/service, and the requesting asset.",
    5: "The enterprise monitors and measures the integrity and security posture of all owned and associated assets.",
    6: "All resource authentication and authorization are dynamic and strictly enforced before access is allowed.",
    7: "The enterprise collects as much information as possible about the current state of assets, network infrastructure and communications and uses it to improve its security posture."
  };
  const COMPUTE = ["ec2", "asg", "ecs", "eks", "lambda"];
  const SEVN = { crit: "Critical", high: "High", med: "Medium", low: "Low", info: "Note" };

  function analyzeZT(S, helpers) {
    const P = helpers.P; const N = S.nodes.filter((x) => !C[x.type].container);
    const of = (...t) => N.filter((x) => t.includes(x.type)); const has = (...t) => of(...t).length > 0;
    const nb = (a) => S.edges.filter((e) => e.from === a.id || e.to === a.id).map((e) => S.nodes.find((x) => x.id === (e.from === a.id ? e.to : e.from))).filter(Boolean);
    const linked = (a, types) => nb(a).some((o) => types.includes(o.type));
    const avail = (type) => { const t = { type, props: {} }; C[type].props.forEach((d) => { t.props[d.k] = d.def; }); return !AD.cost(t, P).some((l) => l.na); };
    const F = []; const add = (f) => F.push(f);
    const R = (nist, cisa) => ({ nist, cisa });
    const workforce = of("users").some((u) => u.props.audience !== "Customers");
    const vpcs = S.nodes.filter((x) => x.type === "vpc"); const vpcNodes = N.filter((x) => C[x.type].vpc);
    const inRole = (x, role) => { const a = helpers.accountOf(S, x); return !!a && a.props.role === role; };

    // ---- Identity ----
    const idps = of("idc", "idp"); const ids = of("idc", "idp", "cognito");
    if (!idps.length && (workforce || has("ec2", "asg", "ecs", "eks"))) add({ id: "zt-no-idp", pillar: "id", sev: "high", nodes: [], title: "No central workforce identity provider",
      detail: "People and pipelines should sign in through one identity store and get short-lived credentials. Use IAM Identity Center (optionally federated to Okta or Entra ID) instead of IAM users.",
      refs: R([3, 6], "Identity: Identity Stores"), fix: { label: "Add IAM Identity Center", apply: (st) => { const v = st.nodes.find((x) => x.type === "va"); const i = helpers.add(st, "idc", v ? v.x : null, v ? v.y - 160 : null, {}, "IAM Identity Center"); if (v) helpers.link(st, i.id, v.id); } } });
    ids.filter((x) => !x.props.mfa).forEach((x) => add({ id: "zt-mfa-" + x.id, pillar: "id", sev: "high", nodes: [x.id], title: `${x.label} doesn't require MFA`,
      detail: "Passwords alone are the most common way in. Require multi-factor authentication for every sign-in.", refs: R([6], "Identity: Authentication"),
      fix: { label: "Require MFA", apply: (st) => { helpers.node(st, x.id).props.mfa = true; } } }));
    idps.filter((x) => x.props.mfa && !x.props.phish).forEach((x) => add({ id: "zt-phish-" + x.id, pillar: "id", sev: "low", nodes: [x.id], title: `${x.label} MFA isn't phishing-resistant`,
      detail: "CISA's Advanced stage for authentication calls for phishing-resistant MFA such as FIDO2 security keys or passkeys. One-time codes and push approvals can be relayed by a phishing proxy.",
      refs: R([6], "Identity: Authentication"), fix: { label: "Require FIDO2 / passkeys", apply: (st) => { helpers.node(st, x.id).props.phish = true; } } }));
    of("iam").forEach((x) => {
      if (x.props.wildcard) add({ id: "zt-wild-" + x.id, pillar: "id", sev: "crit", nodes: [x.id], title: `${x.label} grants wildcard (*) permissions`,
        detail: "Policies with Action \"*\" or Resource \"*\" break least privilege: one stolen credential reaches everything. Scope actions and resources; IAM Access Analyzer can generate a policy from CloudTrail activity.",
        refs: R([3, 6], "Identity: Access Management"), fix: { label: "Scope to least privilege", apply: (st) => { helpers.node(st, x.id).props.wildcard = false; } } });
      if (x.props.longKeys) add({ id: "zt-keys-" + x.id, pillar: "id", sev: "high", nodes: [x.id], title: `${x.label} relies on long-lived access keys`,
        detail: "Static access keys don't expire and leak easily. Use IAM roles for workloads and IAM Identity Center for people, so every session gets temporary credentials.",
        refs: R([3, 6], "Identity: Authentication"), fix: { label: "Use temporary credentials", apply: (st) => { helpers.node(st, x.id).props.longKeys = false; } } });
    });
    if (has(...COMPUTE) && !has("iam")) add({ id: "zt-no-iam", pillar: "app", sev: "low", nodes: [], title: "Workload roles aren't modeled",
      detail: "Each workload should run with its own narrowly scoped IAM role. Add the roles to the design so the review can check them.", refs: R([6], "Applications & Workloads: Application Access"),
      fix: { label: "Add IAM roles", apply: (st) => { helpers.add(st, "iam", null, null, {}, "Workload IAM roles"); } } });

    // ---- Applications & Workloads: internet path without identity-aware access ----
    const entries = of("alb").filter((a) => a.props.public).concat(of("ec2").filter((e) => e.props.publicIp), of("apigw"));
    const unprotected = entries.filter((x) => !linked(x, ["va", "cognito"]));
    if (unprotected.length) {
      const e0 = unprotected[0];
      const customers = (of("users").length && of("users").every((u) => u.props.audience === "Customers")) || linked(e0, ["cloudfront"]) || e0.type === "apigw";
      const useVa = !customers && avail("va");
      add({ id: "zt-no-iap", pillar: "app", sev: "high", nodes: unprotected.map((x) => x.id), title: "Internet path to the app without identity-aware access",
        detail: "Anyone on the internet can reach the application before proving who they are. Put AWS Verified Access in front of workforce apps (identity and device checked on every request), or authenticate customers with Cognito on the ALB or API." + (!customers && !avail("va") ? ` Verified Access has no price in ${P.meta.region}, so the fix uses Cognito.` : ""),
        refs: R([3, 4, 6], "Applications & Workloads: Application Access"),
        fix: { label: useVa ? "Front with Verified Access" : "Add Cognito authentication", apply: (st) => {
          unprotected.forEach((x0) => { const x = helpers.node(st, x0.id); if (!x) return;
            if (useVa) {
              let v = st.nodes.find((q) => q.type === "va");
              if (!v) v = helpers.add(st, "va", null, null, {}, "Verified Access", { left: true });
              st.edges.forEach((e) => { if (e.to === x.id) { const f = helpers.node(st, e.from); if (f && ["users", "route53"].includes(f.type)) e.to = v.id; } });
              st.edges.forEach((e) => { const f = helpers.node(st, e.from); if (f && f.type === "users" && e.to !== v.id) { const t = helpers.node(st, e.to); if (t && t.type === "igw") e.to = v.id; } });
              st.edges = st.edges.filter((e) => { const o = helpers.node(st, e.from === x.id ? e.to : e.to === x.id ? e.from : null); return !(o && o.type === "igw"); });
              helpers.link(st, v.id, x.id);
              if (x.type === "alb") x.props.public = false;
              if (x.type === "ec2") { x.props.publicIp = false; helpers.moveToPrivate(st, x.id); }
              const idp = st.nodes.find((q) => q.type === "idc" || q.type === "idp"); if (idp) helpers.link(st, idp.id, v.id);
            } else {
              let c = st.nodes.find((q) => q.type === "cognito"); if (!c) c = helpers.add(st, "cognito", null, null, {}, "Cognito user pool", { left: true });
              helpers.link(st, c.id, x.id);
            } });
        } } });
    }

    // ---- Networks ----
    const flatNodes = N.filter((x) => x.props.sg && x.props.sg !== "Tier SGs only");
    const subs = S.nodes.filter((x) => x.type === "subnet");
    const noPrivate = vpcs.length && subs.length && !subs.some((s) => s.props.tier === "private") && vpcNodes.some((x) => ["ec2", "asg", "ecs", "eks", "rds", "aurora", "elasticache"].includes(x.type));
    if (flatNodes.length || noPrivate) add({ id: "zt-flat", pillar: "net", sev: "high", nodes: flatNodes.map((x) => x.id), title: "Flat network: tiers can reach each other freely",
      detail: (noPrivate ? "Everything sits in one public subnet. " : "") + "Segment by tier: private subnets for app and data, and security groups that only admit the tier in front (reference security group IDs, not CIDR ranges). A foothold in one tier then can't reach the rest.",
      refs: R([2, 6], "Networks: Network Segmentation"), fix: { label: "Segment by tier", apply: (st) => {
        st.nodes.forEach((x) => { if (x.props && x.props.sg) x.props.sg = "Tier SGs only"; if (x.type === "ec2") x.props.publicIp = false; });
        if (noPrivate) helpers.ensurePrivateTier(st);
      } } });
    of("rds", "aurora").filter((d) => d.props.public).forEach((d) => add({ id: "zt-pubdb-" + d.id, pillar: "net", sev: "crit", nodes: [d.id], title: `${d.label} is reachable from the internet`,
      detail: "A publicly accessible database is exposed to credential stuffing and exploits. Keep it private and reach it only from the app tier.", refs: R([2, 6], "Networks: Network Segmentation"),
      fix: { label: "Make private", apply: (st) => { helpers.node(st, d.id).props.public = false; } } }));
    of("ec2", "asg").filter((c) => c.props.sshOpen).forEach((c) => add({ id: "zt-ssh-" + c.id, pillar: "net", sev: "high", nodes: [c.id], title: `${c.label} has SSH open to 0.0.0.0/0`,
      detail: "Standing network access for admins is the opposite of per-session access. Close port 22 and use Systems Manager Session Manager, which authenticates with IAM and logs every session.",
      refs: R([3, 6], "Networks: Network Traffic Management"), fix: { label: "Close port 22", apply: (st) => { helpers.node(st, c.id).props.sshOpen = false; } } }));
    const nats = of("nat"); const inVpcCompute = of("ec2", "asg", "ecs", "eks");
    if (nats.length && inVpcCompute.length && !has("vpce")) add({ id: "zt-nat-api", pillar: "net", sev: "med", nodes: nats.map((x) => x.id), title: "AWS API calls leave through the NAT gateway",
      detail: `Without interface endpoints, calls to STS, KMS, Secrets Manager and other AWS APIs go to public endpoints through NAT (${fmt(P.natGb)}/GB processed). Interface endpoints (PrivateLink) keep them on the AWS network, and endpoint policies can restrict which principals and resources are allowed.`,
      refs: R([2], "Networks: Network Traffic Management"), fix: avail("vpce") ? { label: "Add interface endpoints", apply: (st) => { const c = st.nodes.find((x) => ["ec2", "asg", "ecs", "eks"].includes(x.type)); const e = helpers.add(st, "vpce", c.x + 140, c.y, {}, "Interface endpoints"); helpers.link(st, c.id, e.id); } } : null });
    if (has("s3", "dynamodb") && vpcs.length && inVpcCompute.length && !has("gwep") && vpcs.some((v) => !v.props.gwEndpoints)) add({ id: "zt-gwep", pillar: "net", sev: "low", nodes: [], title: "S3 / DynamoDB traffic isn't on a private path",
      detail: "Gateway endpoints for S3 and DynamoDB are free, keep that traffic off the internet path, and support endpoint policies that pin access to your own buckets and tables.",
      refs: R([2], "Networks: Network Traffic Management"), fix: { label: "Add gateway endpoints", apply: (st) => st.nodes.forEach((v) => { if (v.type === "vpc") v.props.gwEndpoints = true; }) } });
    if (nats.length && !has("nfw")) add({ id: "zt-egress", pillar: "net", sev: "low", nodes: nats.map((x) => x.id), title: "Outbound internet traffic isn't inspected",
      detail: "Workloads can reach any internet destination. AWS Network Firewall in the egress path adds domain allow-lists and stateful inspection, so a compromised host can't call out freely.",
      refs: R([2, 7], "Networks: Network Traffic Management"), fix: avail("nfw") ? { label: "Add Network Firewall", apply: (st) => { const x = helpers.node(st, nats[0].id); helpers.add(st, "nfw", x.x - 140, x.y, {}, "Network Firewall"); } } : null });
    of("lattice").filter((l) => l.props.auth !== "AWS_IAM").forEach((l) => add({ id: "zt-lattice-auth-" + l.id, pillar: "net", sev: "high", nodes: [l.id], title: `${l.label} accepts unauthenticated requests`,
      detail: "With auth type NONE, any client that can reach the service network can call every service. Use AWS_IAM so each request is SigV4-signed and checked against an auth policy.",
      refs: R([2, 6], "Networks: Network Segmentation"), fix: { label: "Require AWS_IAM auth", apply: (st) => { helpers.node(st, l.id).props.auth = "AWS_IAM"; } } }));
    const pairs = [];
    S.edges.forEach((e) => { const a = N.find((x) => x.id === e.from), b = N.find((x) => x.id === e.to);
      if (a && b && COMPUTE.includes(a.type) && COMPUTE.includes(b.type) && b.type !== "lambda") pairs.push([a, b]); });
    const ewBad = pairs.filter((pr) => !(has("pca") && pr.every((x) => x.type === "lambda" || x.props.mtls)));
    if (ewBad.length) {
      const useLat = avail("lattice");
      add({ id: "zt-east-west", pillar: "net", sev: "high", nodes: [...new Set(ewBad.flat().map((x) => x.id))], title: "Service-to-service calls are trusted by network location",
        detail: "These services call each other directly, so anything inside the VPC is implicitly trusted. Authenticate every call: route it through VPC Lattice with an AWS_IAM auth policy, or use mutual TLS with certificates from AWS Private CA." + (useLat ? "" : ` VPC Lattice has no price in ${P.meta.region}, so the fix uses Private CA mTLS.`),
        refs: R([2, 6], "Applications & Workloads: Application Access · Networks: Traffic Encryption"),
        fix: { label: useLat ? "Route through VPC Lattice (AWS_IAM)" : "Enable mTLS with Private CA", apply: (st) => {
          if (useLat) {
            let l = st.nodes.find((x) => x.type === "lattice"); const a0 = helpers.node(st, ewBad[0][0].id);
            if (!l) l = helpers.add(st, "lattice", a0.x, a0.y - 140, { services: Math.max(2, new Set(ewBad.flat().map((x) => x.id)).size) }, "VPC Lattice");
            l.props.auth = "AWS_IAM";
            ewBad.forEach(([a, b]) => { st.edges = st.edges.filter((e) => !((e.from === a.id && e.to === b.id) || (e.from === b.id && e.to === a.id))); helpers.link(st, a.id, l.id); helpers.link(st, l.id, b.id); });
          } else {
            if (!st.nodes.some((x) => x.type === "pca")) helpers.add(st, "pca", null, null, {}, "Private CA (mTLS)");
            ewBad.flat().forEach((x) => { const y = helpers.node(st, x.id); if ("mtls" in y.props) y.props.mtls = true; });
          } } } });
    }

    // ---- Data ----
    const rest = of("rds", "aurora").filter((d) => !d.props.encrypted).concat(of("ec2", "asg", "eks").filter((c) => c.props.ebsEnc === false));
    if (rest.length) add({ id: "zt-rest", pillar: "data", sev: "high", nodes: rest.map((x) => x.id), title: "Data at rest isn't encrypted everywhere",
      detail: "Encrypt every data store with KMS (RDS/Aurora storage encryption, EBS encryption by default). RDS encryption can't be switched on in place: restore an encrypted copy of a snapshot.",
      refs: R([1], "Data: Data Encryption"), fix: { label: "Encrypt at rest", apply: (st) => rest.forEach((x) => { const y = helpers.node(st, x.id); if ("encrypted" in y.props) y.props.encrypted = true; if ("ebsEnc" in y.props) y.props.ebsEnc = true; }) } });
    const transit = of("alb").filter((a) => !a.props.https).concat(of("rds", "aurora").filter((d) => !d.props.tls));
    if (transit.length) add({ id: "zt-transit", pillar: "data", sev: "high", nodes: transit.map((x) => x.id), title: "Traffic isn't encrypted in transit everywhere",
      detail: "Use HTTPS listeners with ACM certificates and require TLS to the database (rds.force_ssl for PostgreSQL, require_secure_transport for MySQL). Internal traffic deserves the same protection as internet traffic.",
      refs: R([2], "Data: Data Encryption · Networks: Traffic Encryption"), fix: { label: "Require TLS", apply: (st) => transit.forEach((x) => { const y = helpers.node(st, x.id); if ("https" in y.props) y.props.https = true; if ("tls" in y.props) y.props.tls = true; }) } });
    of("s3").filter((b) => !b.props.blockPublic).forEach((b) => add({ id: "zt-s3pub-" + b.id, pillar: "data", sev: "high", nodes: [b.id], title: `${b.label} can be made public`,
      detail: "Keep S3 Block Public Access on and grant access through identities and bucket policies, not anonymous reads.", refs: R([6], "Data: Data Access"),
      fix: { label: "Block public access", apply: (st) => { helpers.node(st, b.id).props.blockPublic = true; } } }));
    if (has("rds", "aurora", "s3", "dynamodb", "ec2", "asg") && !has("kms")) add({ id: "zt-kms", pillar: "data", sev: "low", nodes: [], title: "No customer managed KMS keys",
      detail: "AWS managed keys encrypt by default, but customer managed keys let you write key policies (who may decrypt), control rotation, and see every use in CloudTrail.", refs: R([1, 6], "Data: Data Encryption"),
      fix: { label: "Add KMS keys", apply: (st) => { helpers.add(st, "kms", null, null, {}, "KMS keys"); } } });
    if (has("s3") && !has("macie")) add({ id: "zt-macie", pillar: "data", sev: "low", nodes: of("s3").map((x) => x.id), title: "Nobody is looking for sensitive data in S3",
      detail: avail("macie") ? "Macie inventories buckets and finds sensitive data (PII, credentials), so you know what each bucket holds before deciding who can read it." : `Macie has no price in the AWS Price List for ${P.meta.region}, so this tool can't add it there. Plan another data-discovery method for this region.`,
      refs: R([1, 7], "Data: Data Inventory Management · Data Categorization"), fix: avail("macie") ? { label: "Add Macie", apply: (st) => helpers.addTool(st, "macie", "security") } : null });

    // ---- Visibility, automation, governance ----
    const tool = (type, pillar, sev, title, detail, tenets, cisa, role) => { if (!has(type)) add({ id: "zt-no-" + type, pillar, sev, nodes: [], title, detail: detail + (avail(type) ? "" : ` (${C[type].full} has no price in ${P.meta.region}, so it can't be added here.)`), refs: R(tenets, cisa),
      fix: avail(type) ? { label: "Add " + C[type].name, apply: (st) => helpers.addTool(st, type, role) } : null }); };
    if (N.length) {
      tool("cloudtrail", "vis", "crit", "No CloudTrail audit log", "Without CloudTrail there is no record of who did what. Create a multi-region organization trail with log file validation, delivered to a separate log-archive account.", [7], "Visibility & Analytics", "log-archive");
      if (vpcs.length) tool("flowlogs", "vis", "med", "No VPC Flow Logs", "Flow logs record accepted and rejected connections. You need them to investigate lateral movement and to tune security groups.", [7], "Networks · Visibility & Analytics", "log-archive");
      tool("guardduty", "vis", "high", "No threat detection (GuardDuty)", "GuardDuty analyzes CloudTrail, VPC Flow Logs and DNS logs for compromised credentials, crypto-mining and unusual API use.", [5, 7], "Devices: Device Threat Protection · Visibility & Analytics", "security");
      tool("config", "auto", "med", "No continuous configuration monitoring (AWS Config)", "AWS Config records every resource change and evaluates rules continuously, so drift from your baseline is caught and can be remediated automatically.", [5], "Automation & Orchestration", "security");
      tool("sechub", "auto", "med", "No central security findings (Security Hub)", "Security Hub aggregates findings from GuardDuty, Macie, Config and Inspector across accounts and runs the AWS Foundational Security Best Practices checks.", [5, 7], "Automation & Orchestration · Visibility & Analytics", "security");
      if (has("cloudtrail") && !has("seclake", "detective")) { const t = avail("seclake") ? "seclake" : avail("detective") ? "detective" : null;
        add({ id: "zt-analytics", pillar: "vis", sev: "low", nodes: [], title: "Logs are collected but not correlated", detail: "Centralize and normalize security logs (Security Lake stores them as OCSF) or use Detective to investigate across them, so analysts can follow an attacker across services.", refs: R([7], "Visibility & Analytics"),
          fix: t ? { label: "Add " + C[t].name, apply: (st) => helpers.addTool(st, t, t === "seclake" ? "log-archive" : "security") } : null }); }
      tool("org", "gov", "med", "No organization-wide guardrails (SCPs)", "AWS Organizations with service control policies sets limits no one in a member account can override, such as never disabling CloudTrail or leaving the organization.", [6], "Governance", "management");
    }
    of("cloudtrail").forEach((t) => {
      if (!t.props.orgTrail) add({ id: "zt-orgtrail-" + t.id, pillar: "gov", sev: "low", nodes: [t.id], title: `${t.label} isn't an organization trail`, detail: "An organization trail logs every member account automatically, including accounts created later, and member accounts can't turn it off.", refs: R([7], "Governance · Visibility & Analytics"), fix: { label: "Make it an organization trail", apply: (st) => { helpers.node(st, t.id).props.orgTrail = true; } } });
      if (!t.props.validation) add({ id: "zt-ctval-" + t.id, pillar: "vis", sev: "low", nodes: [t.id], title: `${t.label} has no log file validation`, detail: "Log file integrity validation produces signed digest files so you can show log files weren't changed or deleted after delivery.", refs: R([7], "Visibility & Analytics"), fix: { label: "Turn on validation", apply: (st) => { helpers.node(st, t.id).props.validation = true; } } });
    });
    of("config").forEach((c) => {
      if (!c.props.remediation) add({ id: "zt-remed-" + c.id, pillar: "auto", sev: "low", nodes: [c.id], title: "Misconfigurations are found but not fixed automatically", detail: "Attach Systems Manager Automation remediations to Config rules (for example, turn S3 Block Public Access back on) so drift is corrected in minutes, not days.", refs: R([5], "Automation & Orchestration"), fix: { label: "Enable auto-remediation", apply: (st) => { helpers.node(st, c.id).props.remediation = true; } } });
      if (!c.props.conformance) add({ id: "zt-conf-" + c.id, pillar: "gov", sev: "low", nodes: [c.id], title: "No conformance packs", detail: "Conformance packs deploy a set of Config rules as one unit across the organization, which turns policy into something measurable.", refs: R([5], "Governance"), fix: { label: "Deploy conformance packs", apply: (st) => { helpers.node(st, c.id).props.conformance = true; } } });
    });
    of("va").filter((v) => !v.props.logging).forEach((v) => add({ id: "zt-valog-" + v.id, pillar: "vis", sev: "low", nodes: [v.id], title: "Verified Access decisions aren't logged", detail: "Access logs record every allow and deny with identity and device context. Send them to the log-archive account.", refs: R([7], "Visibility & Analytics"), fix: { label: "Turn on access logs", apply: (st) => { helpers.node(st, v.id).props.logging = true; } } }));
    const logs = of("cloudtrail", "flowlogs", "seclake").filter((x) => !inRole(x, "log-archive"));
    if (logs.length) add({ id: "zt-log-account", pillar: "gov", sev: "high", nodes: logs.map((x) => x.id), title: "Logs live in the same account as the workloads",
      detail: "Anyone who compromises the workload account could delete the evidence. Deliver CloudTrail, Flow Logs and Security Lake data to a dedicated Log Archive account with tightly restricted access.",
      refs: R([7], "Governance · Visibility & Analytics"), fix: { label: "Move to a Log Archive account", apply: (st) => logs.forEach((x) => helpers.moveToAccount(st, x.id, "log-archive")) } });
    const tools = of("guardduty", "sechub", "detective", "config", "macie").filter((x) => !inRole(x, "security"));
    if (tools.length) add({ id: "zt-sec-account", pillar: "gov", sev: "low", nodes: tools.map((x) => x.id), title: "Security tooling isn't in a delegated security account",
      detail: "Run GuardDuty, Security Hub, Config aggregation, Macie and Detective from a dedicated Security Tooling account (delegated administrator), separate from workloads.",
      refs: R([5], "Governance"), fix: { label: "Move to a Security Tooling account", apply: (st) => tools.forEach((x) => helpers.moveToAccount(st, x.id, "security")) } });

    // ---- Devices ----
    const postures = of("posture"); const vas = of("va");
    if (workforce && !postures.length) add({ id: "zt-no-posture", pillar: "dev", sev: "high", nodes: [], title: "Device health isn't part of access decisions",
      detail: "A valid password from an infected or unmanaged laptop still gets in. Feed device posture from an EDR or endpoint manager (CrowdStrike, Jamf, JumpCloud) into Verified Access policies.",
      refs: R([4, 5], "Devices: Policy Enforcement & Compliance Monitoring"), fix: { label: "Add device posture provider", apply: (st) => { const v = st.nodes.find((x) => x.type === "va"); const p = helpers.add(st, "posture", v ? v.x : null, v ? v.y + 160 : null, {}, "Device posture"); if (v) helpers.link(st, p.id, v.id); } } });
    postures.forEach((p) => { const v = vas.find((x) => nb(p).includes(x)) || vas[0];
      if (v && (!v.props.devicePolicy || !linked(p, ["va"]))) add({ id: "zt-posture-enf-" + p.id, pillar: "dev", sev: "med", nodes: [p.id, v.id], title: "Device posture is collected but not enforced",
        detail: "Connect the posture provider to Verified Access as a device trust provider and check it in the access policy, so unhealthy devices are denied on each request.",
        refs: R([4], "Devices: Resource Access"), fix: { label: "Enforce in Verified Access", apply: (st) => { helpers.node(st, v.id).props.devicePolicy = true; helpers.link(st, p.id, v.id); } } });
      if (p.props.vendor === "Microsoft Intune" && v) add({ id: "zt-intune-" + p.id, pillar: "dev", sev: "info", nodes: [p.id], title: "Intune isn't a native Verified Access device trust provider",
        detail: "Verified Access accepts CrowdStrike, Jamf and JumpCloud as device trust providers. Intune compliance usually reaches AWS as an Entra ID claim instead; check that your IdP passes it.", refs: R([4], "Devices: Resource Access"), fix: null }); });

    // ---- region availability ----
    N.forEach((x) => { const na = AD.costUnavailable(AD.cost(x, P)); if (!na.length) return;
      const why = (P.meta.unavailable || {})[x.type];
      add({ id: "zt-region-" + x.id, pillar: ["va", "cognito", "ec2", "asg", "ecs", "eks", "lambda"].includes(x.type) ? "app" : ["lattice", "tgw", "nfw", "vpce", "nat", "alb", "nlb"].includes(x.type) ? "net" : ["macie", "s3", "rds", "aurora", "dynamodb", "elasticache"].includes(x.type) ? "data" : "vis", sev: "high", nodes: [x.id], region: true,
        title: `${x.label}: not available in ${P.meta.region}`, detail: (why || `The AWS Price List has no on-demand price for this in ${P.meta.name}.`) + " It's left out of the total and doesn't count toward maturity here.", refs: R([], "Region availability"), fix: null }); });

    // ---- maturity ladders (each stage requires the previous one) ----
    const usable = (x) => !AD.cost(x, P).some((l) => l.na);
    const hasU = (...t) => of(...t).some(usable);
    const open = (pre) => F.some((f) => f.sev !== "info" && f.id.startsWith(pre));
    const st = {}; const ladder = (k, i, a, o) => { st[k] = !i ? 0 : !a ? 1 : !o ? 2 : 3; };
    ladder("id", (idps.length > 0 || (!workforce && ids.length > 0)) && !open("zt-mfa"), !open("zt-wild") && !open("zt-keys") && !open("zt-phish"),
      (hasU("va") && vas.some((v) => linked(v, ["idc", "idp"]))) || (!workforce && hasU("cognito")));
    if (workforce) ladder("dev", postures.length > 0, !open("zt-posture-enf") && hasU("va"), hasU("guardduty") && hasU("sechub"));
    else ladder("dev", hasU("guardduty"), hasU("sechub"), hasU("config") && of("config").every((c) => c.props.remediation));
    ladder("net", !open("zt-flat") && !open("zt-pubdb") && !open("zt-ssh"), !open("zt-nat-api") && !open("zt-lattice-auth") && of("alb").every((a) => a.props.https),
      !open("zt-east-west") && !open("zt-egress") && !open("zt-gwep") && !F.some((f) => f.region && f.pillar === "net"));
    ladder("app", !open("zt-no-iap"), (hasU("va") || hasU("cognito")) && !open("zt-east-west") && !open("zt-lattice-auth"),
      hasU("iam") && !open("zt-wild") && (hasU("lattice") || (hasU("pca") && of("ec2", "asg", "ecs", "eks").every((c) => c.props.mtls))));
    ladder("data", !open("zt-rest") && !open("zt-s3pub"), !open("zt-transit") && hasU("kms"), !has("s3") || hasU("macie"));
    ladder("vis", hasU("cloudtrail"), (!vpcs.length || hasU("flowlogs")) && hasU("guardduty"), hasU("seclake", "detective") && !open("zt-log-account") && !open("zt-ctval") && !open("zt-valog"));
    ladder("auto", hasU("config") || hasU("sechub"), hasU("config") && hasU("sechub"), of("config").some((c) => c.props.remediation && usable(c)));
    ladder("gov", has("org"), !open("zt-log-account") && !open("zt-sec-account"), !open("zt-orgtrail") && !open("zt-conf") && hasU("cloudtrail") && hasU("config"));
    const empty = N.length === 0;
    const scores = {}; ZP.forEach(([k]) => { scores[k] = PTS[st[k]]; });
    const overall = empty ? null : Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / ZP.length);
    const order = { crit: 0, high: 1, med: 2, low: 3, info: 4 }; F.sort((a, b) => order[a.sev] - order[b.sev]);
    return { findings: F, stages: empty ? null : st, scores: empty ? null : scores, overall };
  }

  // ---------- Zero Trust report (Markdown; also rendered to printable HTML by the app) ----------
  function ztReport(S, z, wa, P, total, money, accountOf) {
    const d = new Date().toISOString().slice(0, 10); const L = [];
    L.push(`# Zero Trust design review: ${S.title}`, "",
      `Generated by Perimeter Zero (norselabs.net) on ${d}. Region: ${S.region} (${P.meta.name}). Estimated on-demand cost: ${money(total, 2)} per month.`, "",
      "> **Disclaimer.** This is an automated review of a diagram, not an assessment of a deployed system. Findings are *aligned with* the CISA Zero Trust Maturity Model v2.0 and the tenets in NIST SP 800-207 section 2.1. They do not show that any system is compliant with, certified against, or authorized under any framework or program. Costs are estimates from public AWS list prices, not quotes.", "",
      `## Zero Trust score: ${z.overall == null ? "n/a" : z.overall + "/100"}`, "", "| Pillar (CISA ZTMM v2) | Maturity stage |", "|---|---|");
    ZP.forEach(([k, l]) => L.push(`| ${l} | ${z.stages ? STAGES[z.stages[k]] : "n/a"} |`));
    const real = z.findings.filter((f) => f.sev !== "info");
    L.push("", `## Findings (${real.length})`, "");
    z.findings.forEach((f, i) => { L.push(`### ${i + 1}. [${SEVN[f.sev]}] ${f.title}`, "",
      `- Pillar: ${ZP.find((p) => p[0] === f.pillar)[1]}`, `- CISA ZTMM v2 reference: ${f.refs.cisa}`,
      `- NIST SP 800-207 tenet${f.refs.nist.length === 1 ? "" : "s"}: ${f.refs.nist.length ? f.refs.nist.join(", ") : "n/a"}`,
      `- Recommendation: ${f.detail}`, f.fix ? `- One-click fix in the tool: ${f.fix.label}` : "- No automatic fix", ""); });
    if (!z.findings.length) L.push("No findings: every rule this reviewer checks is satisfied.", "");
    L.push("## Components", "", "| Component | Service | Account |", "|---|---|---|");
    S.nodes.filter((x) => !C[x.type].container).forEach((x) => { const a = accountOf(S, x); L.push(`| ${x.label.replace(/\|/g, "/")} | ${C[x.type].full} | ${a ? a.label : "not placed"} |`); });
    const wneg = wa.findings.filter((f) => !f.positive && f.sev !== "info");
    L.push("", `## Secondary: AWS Well-Architected review ${wa.overall == null ? "" : "(" + wa.overall + "/100)"}`, "", ...(wneg.length ? wneg.map((f) => `- [${SEVN[f.sev]}] ${f.title}`) : ["- No findings."]), "",
      "## NIST SP 800-207 tenets referenced", "", ...Object.entries(TENETS).map(([k, v]) => `${k}. ${v}`), "",
      "## Method", "", "- Maturity stages (Traditional, Initial, Advanced, Optimal) are assigned per pillar from the capabilities present in the diagram; each stage requires the one before it. The score maps the stages to 10, 40, 70 and 100 points and averages the eight pillars.",
      "- Prices: AWS Price List API regional offer files, on-demand, first paid tier, 730 hours per month. Services without a price in the selected region are marked not available and excluded.", "",
      "Sources: CISA, *Zero Trust Maturity Model*, Version 2.0 (April 2023). NIST, *SP 800-207 Zero Trust Architecture* (August 2020). AWS Price List API.");
    return L.join("\n");
  }

  // ---------- Zero Trust templates ----------
  let seq = 0;
  function T(build) {
    return function () {
      seq = 0; const nodes = [], edges = [], ids = {};
      const mk = (key, type, x, y, props, label, w, h) => { const def = C[type]; const p = {}; def.props.forEach((d) => { p[d.k] = d.def; }); Object.assign(p, props || {});
        const nd = { id: "n" + (++seq), type, x, y, label: label || def.name, props: p }; if (def.container) { nd.w = w || def.w; nd.h = h || def.h; } nodes.push(nd); ids[key] = nd.id; return nd; };
      const ln = (a, b) => edges.push({ id: "e" + (++seq), from: ids[a], to: ids[b] });
      const meta = build(mk, ln); const o = { v: 1, title: meta.title, template: meta.key, nodes, edges }; if (meta.region) o.region = meta.region; return o;
    };
  }
  function vpc2(mk, x, y, rows, region) {
    mk("vpc", "vpc", x, y, { gwEndpoints: false }, "VPC 10.0.0.0/16", 840, 720);
    ["a", "b"].forEach((z, i) => { const ax = x + 120 + i * 360; mk("az" + z, "az", ax, y + 120, { zone: z }, "Availability Zone " + (region || "us-east-1") + z, 340, 580);
      rows.forEach((r, j) => mk("sn" + z + j, "subnet", ax + 20, y + 170 + j * 175, { tier: r[0] }, r[1], 300, 155)); });
  }
  function secAccounts(mk, ln, x, opt) {
    opt = opt || {};
    mk("acSec", "account", x, -20, { role: "security" }, "Security Tooling account", 300, 560);
    mk("gd", "guardduty", x + 20, 40, { eventsM: 5, logGb: 40 }, "GuardDuty"); mk("sh", "sechub", x + 160, 40, {}, "Security Hub");
    mk("cfg", "config", x + 20, 180, {}, "AWS Config"); mk("det", "detective", x + 160, 180, {}, "Detective");
    if (opt.macie !== false) mk("mac", "macie", x + 20, 320, { buckets: 6, gb: 10 }, "Macie");
    mk("acLog", "account", x, 580, { role: "log-archive" }, "Log Archive account", 300, 340);
    mk("ct", "cloudtrail", x + 20, 640, {}, "Org CloudTrail"); mk("fl", "flowlogs", x + 160, 640, { gb: 40 }, "VPC Flow Logs");
    mk("sl", "seclake", x + 20, 780, { gb: 40 }, "Security Lake");
    mk("acMgmt", "account", x + 340, -20, { role: "management" }, "Management account", 180, 180);
    mk("org", "org", x + 374, 40, { scps: 4 }, "Org + SCPs");
    ln("gd", "sh"); ln("cfg", "sh"); ln("ct", "sl"); ln("fl", "sl"); ln("gd", "det");
    if (opt.macie !== false) ln("mac", "sh");
  }
  const ZT = {
    ztThreeTier: { name: "Zero Trust 3-tier web app", blurb: "Verified Access front door, private endpoints, mTLS, separate security and log-archive accounts", make: T((mk, ln) => {
      mk("users", "users", 20, 360, { audience: "Workforce" }, "Workforce users");
      mk("idc", "idc", 200, 20, { users: 300, phish: true }, "IAM Identity Center");
      mk("idp", "idp", 200, 180, { vendor: "Okta", phish: true }, "Okta (IdP)");
      mk("va", "va", 200, 360, { apps: 2, gb: 150 }, "Verified Access");
      mk("pos", "posture", 200, 540, { vendor: "CrowdStrike" }, "CrowdStrike posture");
      mk("acW", "account", 380, -20, { role: "workload" }, "Workload account (prod)", 1020, 820);
      vpc2(mk, 400, 40, [["private", "Private app subnet"], ["private", "Private data subnet"], ["private", "Endpoint subnet"]]);
      mk("alb", "alb", 640, 60, { public: false, lcu: 3, https: true }, "Internal ALB (mTLS)");
      mk("asg", "asg", 560, 230, { azs: 2, count: 4, itype: "m7i.large", mtls: true }, "App tier ASG");
      mk("rds", "rds", 560, 405, { az: "a", multiAz: true, cls: "db.r7g.large", gb: 200, tls: true }, "Orders DB");
      mk("cache", "elasticache", 700, 405, {}, "Session cache");
      mk("vpce", "vpce", 560, 580, {}, "Interface endpoints");
      mk("gwep", "gwep", 700, 580, {}, "Gateway endpoints");
      mk("kms", "kms", 1270, 60, { keys: 3 }, "KMS keys"); mk("sec", "secrets", 1270, 200, {}, "Secrets Manager");
      mk("iam", "iam", 1270, 340, {}, "Workload IAM roles"); mk("pca", "pca", 1270, 480, {}, "Private CA (mTLS)");
      mk("s3", "s3", 1270, 620, { gb: 300 }, "Assets bucket");
      secAccounts(mk, ln, 1440);
      ln("users", "va"); ln("idp", "idc"); ln("idp", "va"); ln("pos", "va"); ln("va", "alb"); ln("pca", "alb"); ln("alb", "asg");
      ln("asg", "rds"); ln("asg", "cache"); ln("asg", "vpce"); ln("asg", "gwep"); ln("gwep", "s3"); ln("vpce", "sec"); ln("vpce", "kms"); ln("iam", "asg");
      return { key: "ztThreeTier", title: "Zero Trust 3-tier web app" };
    }) },
    ztGov: { name: "Zero Trust GovCloud workload", blurb: "us-gov-west-1: Verified Access, Network Firewall egress, Transit Gateway, Private CA mTLS, central logging", make: T((mk, ln) => {
      const R = "us-gov-west-1";
      mk("users", "users", 20, 360, { audience: "Workforce" }, "Agency users");
      mk("idc", "idc", 200, 20, { users: 500, phish: true }, "IAM Identity Center");
      mk("idp", "idp", 200, 180, { vendor: "Microsoft Entra ID", phish: true }, "Entra ID (IdP)");
      mk("va", "va", 200, 360, { apps: 3, gb: 200 }, "Verified Access");
      mk("pos", "posture", 200, 540, { vendor: "CrowdStrike" }, "CrowdStrike posture");
      mk("acW", "account", 380, -20, { role: "workload" }, "Workload account (GovCloud)", 1020, 820);
      vpc2(mk, 400, 40, [["public", "Firewall + NAT subnet"], ["private", "Private app subnet"], ["private", "Private data subnet"]], R);
      mk("alb", "alb", 640, 60, { public: false, lcu: 3, https: true }, "Internal ALB (mTLS)");
      mk("nfw", "nfw", 560, 230, { endpoints: 2, gb: 150 }, "Network Firewall");
      mk("nat", "nat", 700, 230, { az: "a", gb: 150 }, "NAT gateway");
      mk("asg", "asg", 560, 405, { azs: 2, count: 4, itype: "m7i.large", mtls: true }, "App tier ASG");
      mk("vpce", "vpce", 700, 405, { services: "sts, kms, secretsmanager, ssm, ssmmessages, logs" }, "Interface endpoints");
      mk("db", "aurora", 560, 580, { cls: "db.r7g.large", instances: 2, tls: true }, "Case DB (Aurora)");
      mk("gwep", "gwep", 700, 580, {}, "Gateway endpoints");
      mk("kms", "kms", 1270, 60, { keys: 4 }, "KMS keys"); mk("tgw", "tgw", 1270, 200, { attach: 3, gb: 200 }, "Transit Gateway");
      mk("iam", "iam", 1270, 340, {}, "Workload IAM roles"); mk("pca", "pca", 1270, 480, {}, "Private CA (mTLS)");
      mk("s3", "s3", 1270, 620, { gb: 500 }, "Records bucket");
      secAccounts(mk, ln, 1440, { macie: false });
      ln("users", "va"); ln("idp", "idc"); ln("idp", "va"); ln("pos", "va"); ln("va", "alb"); ln("pca", "alb"); ln("alb", "asg");
      ln("asg", "db"); ln("asg", "vpce"); ln("asg", "gwep"); ln("gwep", "s3"); ln("asg", "nfw"); ln("nfw", "nat"); ln("iam", "asg"); ln("tgw", "nfw"); ln("vpce", "kms");
      return { key: "ztGov", title: "Zero Trust GovCloud workload", region: R };
    }) },
    ztMicro: { name: "Zero Trust microservices (VPC Lattice)", blurb: "Cognito customer sign-in, services authenticated by Lattice AWS_IAM policies, operator path via Verified Access", make: T((mk, ln) => {
      mk("users", "users", 20, 220, { audience: "Customers" }, "Customers");
      mk("staff", "users", 20, 560, { audience: "Workforce" }, "Operators");
      mk("waf", "waf", 200, 60, {}, "WAF"); mk("cf", "cloudfront", 200, 220, { gbOut: 300 }, "CloudFront");
      mk("cog", "cognito", 200, 380, { mau: 50000 }, "Cognito user pool");
      mk("va", "va", 200, 560, { apps: 1, gb: 20 }, "Verified Access");
      mk("idc", "idc", 200, 720, { users: 40, phish: true }, "IAM Identity Center");
      mk("pos", "posture", 20, 720, { vendor: "Jamf" }, "Jamf posture");
      mk("acW", "account", 380, -20, { role: "workload" }, "Workload account (prod)", 1020, 880);
      vpc2(mk, 400, 40, [["public", "Public subnet"], ["private", "Private service subnet"], ["private", "Private data subnet"]]);
      mk("igw", "igw", 404, 240, {}, "Internet gateway");
      mk("alb", "alb", 560, 230, { public: true, lcu: 4, https: true }, "Public ALB");
      mk("adm", "alb", 700, 230, { public: false, lcu: 1, https: true }, "Admin ALB");
      mk("lat", "lattice", 640, 60, { services: 3, gb: 150 }, "Lattice network");
      mk("web", "ecs", 560, 405, { azs: 2, tasks: 4 }, "Web / BFF");
      mk("ord", "ecs", 700, 405, { azs: 2, tasks: 3 }, "Orders service");
      mk("pay", "ecs", 920, 405, { azs: 2, tasks: 2 }, "Payments service");
      mk("db", "aurora", 560, 580, { tls: true }, "Orders DB (Aurora)");
      mk("vpce", "vpce", 700, 580, {}, "Interface endpoints"); mk("gwep", "gwep", 920, 580, {}, "Gateway endpoints");
      mk("kms", "kms", 1270, 60, { keys: 3 }, "KMS keys"); mk("sec", "secrets", 1270, 200, {}, "Secrets Manager");
      mk("iam", "iam", 1270, 340, {}, "Task IAM roles"); mk("s3", "s3", 1270, 480, { gb: 200 }, "Media bucket");
      mk("ddb", "dynamodb", 1270, 620, {}, "Payments table");
      secAccounts(mk, ln, 1440);
      ln("users", "cf"); ln("waf", "cf"); ln("cf", "alb"); ln("igw", "alb"); ln("cog", "alb"); ln("alb", "web");
      ln("staff", "va"); ln("idc", "va"); ln("pos", "va"); ln("va", "adm"); ln("adm", "ord");
      ln("web", "lat"); ln("lat", "ord"); ln("lat", "pay"); ln("ord", "db"); ln("pay", "ddb"); ln("web", "vpce"); ln("ord", "gwep"); ln("gwep", "s3"); ln("iam", "web"); ln("vpce", "sec");
      return { key: "ztMicro", title: "Zero Trust microservices" };
    }) },
    ztLegacy: { name: "Before: legacy flat network", blurb: "One public subnet, SSH open, wildcard IAM, no logging. Apply the fixes and watch the score climb", make: T((mk, ln) => {
      mk("users", "users", 20, 200, { audience: "Workforce" }, "Staff + internet");
      mk("vpc", "vpc", 200, 40, {}, "VPC 10.0.0.0/16", 640, 400);
      mk("az", "az", 240, 90, { zone: "a" }, "Availability Zone us-east-1a", 560, 320);
      mk("sn", "subnet", 260, 140, { tier: "public" }, "Shared public subnet", 520, 240);
      mk("igw", "igw", 204, 330, {}, "Internet gateway");
      mk("alb", "alb", 280, 190, { public: true, https: false, lcu: 2 }, "Web ALB");
      mk("app", "ec2", 420, 190, { az: "a", itype: "m6i.large", count: 2, publicIp: true, sshOpen: true, sg: "0.0.0.0/0", ebsEnc: false }, "App servers");
      mk("db", "rds", 560, 190, { az: "a", cls: "db.m6g.large", encrypted: false, tls: false, sg: "Whole VPC CIDR", backupDays: 1 }, "Customer DB");
      mk("s3", "s3", 900, 60, { gb: 400, blockPublic: false }, "Shared bucket");
      mk("iam", "iam", 900, 200, { wildcard: true, longKeys: true, boundary: false }, "Admin IAM user");
      mk("cw", "cloudwatch", 900, 340, { logsGb: 10 }, "CloudWatch");
      ln("users", "igw"); ln("igw", "alb"); ln("alb", "app"); ln("app", "db"); ln("app", "s3"); ln("iam", "app");
      return { key: "ztLegacy", title: "Legacy flat network (before)" };
    }) }
  };
  const merged = {}; Object.assign(merged, ZT, AD.TEMPLATES); AD.TEMPLATES = merged;
  Object.assign(AD, { analyzeZT, ZT_PILLARS: ZP, ZT_STAGES: STAGES, ZT_TENETS: TENETS, ztReport, SEVN });
})();
