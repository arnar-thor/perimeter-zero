/* Perimeter Zero · Terraform for the Zero Trust components (AWS provider v5).
   Only resources that can be generated faithfully; everything else becomes a TODO. Validated with `terraform validate`. */
(function () {
  "use strict";
  AD.terraformExtra = function (c) {
    const { S, REG, out, todo, name, by, linked, q, vpc, vref, privSubs, zones } = c;
    const has = (t) => by(t).length > 0; const zt = [];
    const part = "${data.aws_partition.current.partition}";
    const oneSubPerZone = (k) => privSubs.filter((s, i, a) => a.findIndex((x) => x.zone === s.zone) === i).slice(0, k);
    const subList = (arr) => `[${arr.map((s) => `aws_subnet.${s.r}.id`).join(", ")}]`;
    const slug = (s, n) => (s || "zt").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, n || 40) || "zt";
    let caller = false; const needCaller = () => { if (!caller) { zt.push(`data "aws_caller_identity" "current" {}\n`); caller = true; } };
    const assume = (id, svc) => `data "aws_iam_policy_document" "${id}_assume" {\n  statement {\n    actions = ["sts:AssumeRole"]\n    principals {\n      type        = "Service"\n      identifiers = ["${svc}"]\n    }\n  }\n}\n`;
    const pab = (b) => `resource "aws_s3_bucket_public_access_block" "${b}" {\n  bucket                  = aws_s3_bucket.${b}.id\n  block_public_acls       = true\n  block_public_policy     = true\n  ignore_public_acls      = true\n  restrict_public_buckets = true\n}\n`;

    // ---- private paths to AWS APIs ----
    if (has("vpce")) {
      if (!vref || !privSubs.length) todo.push("Interface endpoints: place them in a VPC with private subnets");
      else {
        zt.push(`resource "aws_security_group" "endpoints" {\n  name   = "vpc-endpoints"\n  vpc_id = ${vref}\n  ingress {\n    from_port   = 443\n    to_port     = 443\n    protocol    = "tcp"\n    cidr_blocks = [${vref.replace(/\.id$/, ".cidr_block")}]\n  }\n}\n`);
        const seen = new Set();
        by("vpce").forEach((e) => { const subs = oneSubPerZone(+e.props.azs || 2);
          String(e.props.services || "").split(/[\s,]+/).map((s) => s.toLowerCase().replace(/[^a-z0-9.-]/g, "")).filter(Boolean).forEach((svc) => {
            if (seen.has(svc)) { todo.push(`Interface endpoint for ${svc} is listed twice; only one was generated (private DNS allows one per VPC)`); return; } seen.add(svc);
            zt.push(`resource "aws_vpc_endpoint" "${svc.replace(/[.-]/g, "_")}" {\n  vpc_id              = ${vref}\n  service_name        = "com.amazonaws.${REG}.${svc}"\n  vpc_endpoint_type   = "Interface"\n  subnet_ids          = ${subList(subs)}\n  security_group_ids  = [aws_security_group.endpoints.id]\n  private_dns_enabled = true\n}\n`); }); });
      }
    }
    if (has("gwep") && !(vpc && vpc.props.gwEndpoints)) {
      const g = by("gwep")[0];
      if (!vref || !zones.length) todo.push("Gateway endpoints: need a VPC with private route tables");
      else [["s3", g.props.s3], ["dynamodb", g.props.ddb]].filter((x) => x[1]).forEach(([svc]) => zt.push(`resource "aws_vpc_endpoint" "gw_${svc}" {\n  vpc_id            = ${vref}\n  service_name      = "com.amazonaws.${REG}.${svc}"\n  vpc_endpoint_type = "Gateway"\n  route_table_ids   = [${zones.map((z) => `aws_route_table.private_${z}.id`).join(", ")}]\n}\n`));
    }

    // ---- visibility ----
    if (has("flowlogs")) {
      if (!vref) todo.push("VPC Flow Logs: needs a VPC");
      else zt.push(`# Single-account version. In a multi-account setup, deliver to an S3 bucket in the Log Archive account instead.\nresource "aws_cloudwatch_log_group" "flow_logs" {\n  name_prefix       = "/vpc/flow-logs/"\n  retention_in_days = 365\n}\n`,
        assume("flow_logs", "vpc-flow-logs.amazonaws.com"),
        `resource "aws_iam_role" "flow_logs" {\n  name_prefix        = "vpc-flow-logs-"\n  assume_role_policy = data.aws_iam_policy_document.flow_logs_assume.json\n}\n`,
        `data "aws_iam_policy_document" "flow_logs" {\n  statement {\n    actions   = ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogGroups", "logs:DescribeLogStreams"]\n    resources = ["\${aws_cloudwatch_log_group.flow_logs.arn}:*"]\n  }\n}\n`,
        `resource "aws_iam_role_policy" "flow_logs" {\n  name   = "flow-logs"\n  role   = aws_iam_role.flow_logs.id\n  policy = data.aws_iam_policy_document.flow_logs.json\n}\n`,
        `resource "aws_flow_log" "vpc" {\n  vpc_id          = ${vref}\n  traffic_type    = "ALL"\n  iam_role_arn    = aws_iam_role.flow_logs.arn\n  log_destination = aws_cloudwatch_log_group.flow_logs.arn\n}\n`);
    }
    if (has("cloudtrail")) {
      const t = by("cloudtrail")[0]; const tn = name(t); needCaller();
      if (t.props.orgTrail) zt.push(`# Organization trails must be created from the management account (or a delegated administrator).\ndata "aws_organizations_organization" "current" {}\n`);
      zt.push(`resource "aws_s3_bucket" "trail" {\n  bucket_prefix = "cloudtrail-logs-"\n}\n`, pab("trail"),
        `data "aws_iam_policy_document" "trail" {\n  statement {\n    sid       = "AWSCloudTrailAclCheck"\n    actions   = ["s3:GetBucketAcl"]\n    resources = [aws_s3_bucket.trail.arn]\n    principals {\n      type        = "Service"\n      identifiers = ["cloudtrail.amazonaws.com"]\n    }\n  }\n  statement {\n    sid       = "AWSCloudTrailWrite"\n    actions   = ["s3:PutObject"]\n    resources = ["\${aws_s3_bucket.trail.arn}/AWSLogs/\${data.aws_caller_identity.current.account_id}/*"${t.props.orgTrail ? `, "\${aws_s3_bucket.trail.arn}/AWSLogs/\${data.aws_organizations_organization.current.id}/*"` : ""}]\n    principals {\n      type        = "Service"\n      identifiers = ["cloudtrail.amazonaws.com"]\n    }\n    condition {\n      test     = "StringEquals"\n      variable = "s3:x-amz-acl"\n      values   = ["bucket-owner-full-control"]\n    }\n  }\n}\n`,
        `resource "aws_s3_bucket_policy" "trail" {\n  bucket = aws_s3_bucket.trail.id\n  policy = data.aws_iam_policy_document.trail.json\n}\n`,
        `resource "aws_cloudtrail" "${tn}" {\n  name                          = ${q(slug(t.label, 60))}\n  s3_bucket_name                = aws_s3_bucket.trail.id\n  is_multi_region_trail         = true\n  include_global_service_events = true\n  enable_log_file_validation    = ${!!t.props.validation}\n  is_organization_trail         = ${!!t.props.orgTrail}\n${+t.props.dataM > 0 ? `  event_selector {\n    read_write_type           = "All"\n    include_management_events = true\n    data_resource {\n      type   = "AWS::S3::Object"\n      values = ["arn:${part}:s3"]\n    }\n  }\n` : ""}  depends_on = [aws_s3_bucket_policy.trail]\n}\n`);
    }
    if (has("guardduty")) zt.push(`resource "aws_guardduty_detector" "main" {\n  enable = true\n}\n`);
    if (has("sechub")) zt.push(`resource "aws_securityhub_account" "main" {}\n`, `resource "aws_securityhub_standards_subscription" "fsbp" {\n  standards_arn = "arn:${part}:securityhub:${REG}::standards/aws-foundational-security-best-practices/v/1.0.0"\n  depends_on    = [aws_securityhub_account.main]\n}\n`);
    if (has("config")) {
      const cf = by("config")[0]; needCaller();
      zt.push(`resource "aws_s3_bucket" "config" {\n  bucket_prefix = "config-history-"\n}\n`, pab("config"),
        `data "aws_iam_policy_document" "config_bucket" {\n  statement {\n    actions   = ["s3:GetBucketAcl", "s3:ListBucket"]\n    resources = [aws_s3_bucket.config.arn]\n    principals {\n      type        = "Service"\n      identifiers = ["config.amazonaws.com"]\n    }\n  }\n  statement {\n    actions   = ["s3:PutObject"]\n    resources = ["\${aws_s3_bucket.config.arn}/AWSLogs/\${data.aws_caller_identity.current.account_id}/Config/*"]\n    principals {\n      type        = "Service"\n      identifiers = ["config.amazonaws.com"]\n    }\n    condition {\n      test     = "StringEquals"\n      variable = "s3:x-amz-acl"\n      values   = ["bucket-owner-full-control"]\n    }\n  }\n}\n`,
        `resource "aws_s3_bucket_policy" "config" {\n  bucket = aws_s3_bucket.config.id\n  policy = data.aws_iam_policy_document.config_bucket.json\n}\n`,
        assume("config", "config.amazonaws.com"),
        `resource "aws_iam_role" "config" {\n  name_prefix        = "aws-config-"\n  assume_role_policy = data.aws_iam_policy_document.config_assume.json\n}\n`,
        `resource "aws_iam_role_policy_attachment" "config" {\n  role       = aws_iam_role.config.name\n  policy_arn = "arn:${part}:iam::aws:policy/service-role/AWS_ConfigRole"\n}\n`,
        `resource "aws_config_configuration_recorder" "main" {\n  name     = "default"\n  role_arn = aws_iam_role.config.arn\n  recording_group {\n    all_supported                 = true\n    include_global_resource_types = true\n  }\n}\n`,
        `resource "aws_config_delivery_channel" "main" {\n  name           = "default"\n  s3_bucket_name = aws_s3_bucket.config.bucket\n  depends_on     = [aws_config_configuration_recorder.main, aws_s3_bucket_policy.config]\n}\n`,
        `resource "aws_config_configuration_recorder_status" "main" {\n  name       = aws_config_configuration_recorder.main.name\n  is_enabled = true\n  depends_on = [aws_config_delivery_channel.main]\n}\n`);
      if (cf.props.conformance) todo.push("AWS Config conformance packs: choose a pack template (for example Operational Best Practices for NIST 800-53) and add aws_config_conformance_pack");
      if (cf.props.remediation) todo.push("AWS Config auto-remediation: add aws_config_remediation_configuration for each rule you want fixed automatically");
    }
    if (has("macie")) zt.push(`resource "aws_macie2_account" "main" {}\n`);
    if (has("detective")) zt.push(`resource "aws_detective_graph" "main" {}\n`);

    // ---- mTLS / service network / transit ----
    by("pca").forEach((p) => { const pn = name(p);
      zt.push(`resource "aws_acmpca_certificate_authority" "${pn}" {\n  type       = "ROOT"\n  usage_mode = "${p.props.mode === "General-purpose" ? "GENERAL_PURPOSE" : "SHORT_LIVED_CERTIFICATE"}"\n  certificate_authority_configuration {\n    key_algorithm     = "EC_prime256v1"\n    signing_algorithm = "SHA256WITHECDSA"\n    subject {\n      common_name = ${q(slug(S.title, 40) + " internal CA")}\n    }\n  }\n  permanent_deletion_time_in_days = 7\n}\n`,
        `resource "aws_acmpca_certificate" "${pn}_root" {\n  certificate_authority_arn   = aws_acmpca_certificate_authority.${pn}.arn\n  certificate_signing_request = aws_acmpca_certificate_authority.${pn}.certificate_signing_request\n  signing_algorithm           = "SHA256WITHECDSA"\n  template_arn                = "arn:${part}:acm-pca:::template/RootCACertificate/V1"\n  validity {\n    type  = "YEARS"\n    value = 10\n  }\n}\n`,
        `resource "aws_acmpca_certificate_authority_certificate" "${pn}" {\n  certificate_authority_arn = aws_acmpca_certificate_authority.${pn}.arn\n  certificate               = aws_acmpca_certificate.${pn}_root.certificate\n  certificate_chain         = aws_acmpca_certificate.${pn}_root.certificate_chain\n}\n`); });
    if (by("pca").length && by("alb").length) todo.push("ALB mutual TLS: export the Private CA bundle to S3 and add aws_lb_trust_store + an HTTPS listener with mutual_authentication { mode = \"verify\" }");
    by("lattice").forEach((l) => { const ln = name(l); needCaller();
      zt.push(`resource "aws_vpclattice_service_network" "${ln}" {\n  name      = ${q(slug(l.label, 50) || "service-network")}\n  auth_type = "${l.props.auth === "AWS_IAM" ? "AWS_IAM" : "NONE"}"\n}\n`);
      if (vref) zt.push(`resource "aws_vpclattice_service_network_vpc_association" "${ln}" {\n  vpc_identifier             = ${vref}\n  service_network_identifier = aws_vpclattice_service_network.${ln}.id\n}\n`);
      if (l.props.auth === "AWS_IAM") zt.push(`# Only signed requests from principals in this account may invoke services; tighten per service.\nresource "aws_vpclattice_auth_policy" "${ln}" {\n  resource_identifier = aws_vpclattice_service_network.${ln}.arn\n  policy = jsonencode({\n    Version = "2012-10-17"\n    Statement = [{\n      Effect    = "Allow"\n      Principal = "*"\n      Action    = "vpc-lattice-svcs:Invoke"\n      Resource  = "*"\n      Condition = {\n        StringEquals = { "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id }\n      }\n    }]\n  })\n}\n`);
      todo.push(`VPC Lattice "${l.label}": add aws_vpclattice_service, target groups and listeners for each service`); });
    by("tgw").forEach((t) => { const tn = name(t);
      zt.push(`resource "aws_ec2_transit_gateway" "${tn}" {\n  description                     = ${q(t.label)}\n  default_route_table_association = "disable"\n  default_route_table_propagation = "disable"\n}\n`);
      if (vref && privSubs.length) zt.push(`resource "aws_ec2_transit_gateway_vpc_attachment" "${tn}" {\n  transit_gateway_id = aws_ec2_transit_gateway.${tn}.id\n  vpc_id             = ${vref}\n  subnet_ids         = ${subList(oneSubPerZone(3))}\n}\n`); });

    // ---- identity ----
    by("cognito").forEach((u) => zt.push(`resource "aws_cognito_user_pool" "${name(u)}" {\n  name              = ${q(slug(u.label, 60))}\n  mfa_configuration = "${u.props.mfa ? "ON" : "OFF"}"\n${u.props.mfa ? `  software_token_mfa_configuration {\n    enabled = true\n  }\n` : ""}  password_policy {\n    minimum_length    = 12\n    require_lowercase = true\n    require_uppercase = true\n    require_numbers   = true\n    require_symbols   = true\n  }\n}\n`));
    by("va").forEach((v) => { const vn = name(v);
      zt.push(`resource "aws_verifiedaccess_instance" "${vn}" {\n  description = ${q(v.label)}\n}\n`);
      const att = [];
      const user = linked(v, ["idc"])[0] || linked(v, ["idp"])[0] || by("idc")[0] || by("idp")[0];
      if (user && user.type === "idc") { zt.push(`resource "aws_verifiedaccess_trust_provider" "${vn}_idc" {\n  policy_reference_name    = "idc"\n  trust_provider_type      = "user"\n  user_trust_provider_type = "iam-identity-center"\n}\n`); att.push("idc"); }
      else if (user) {
        if (!out.concat(zt).some((x) => x.startsWith('variable "oidc_issuer"'))) ["oidc_issuer", "oidc_authorization_endpoint", "oidc_token_endpoint", "oidc_user_info_endpoint", "oidc_client_id", "oidc_client_secret"].forEach((k) => zt.push(`variable "${k}" {\n  type${k === "oidc_client_secret" ? "      = string\n  sensitive = true" : " = string"}\n}\n`));
        zt.push(`resource "aws_verifiedaccess_trust_provider" "${vn}_oidc" {\n  policy_reference_name    = "idp"\n  trust_provider_type      = "user"\n  user_trust_provider_type = "oidc"\n  oidc_options {\n    issuer                 = var.oidc_issuer\n    authorization_endpoint = var.oidc_authorization_endpoint\n    token_endpoint         = var.oidc_token_endpoint\n    user_info_endpoint     = var.oidc_user_info_endpoint\n    client_id              = var.oidc_client_id\n    client_secret          = var.oidc_client_secret\n    scope                  = "openid email profile"\n  }\n}\n`); att.push("oidc"); }
      else todo.push(`Verified Access "${v.label}": connect an identity provider (IAM Identity Center or OIDC) as a user trust provider`);
      const dev = linked(v, ["posture"])[0];
      if (dev && v.props.devicePolicy) { const t = { CrowdStrike: "crowdstrike", Jamf: "jamf", JumpCloud: "jumpcloud" }[dev.props.vendor];
        if (t) { if (t === "jamf" && !out.concat(zt).some((x) => x.startsWith('variable "jamf_tenant_id"'))) zt.push(`variable "jamf_tenant_id" {\n  type = string\n}\n`);
          zt.push(`resource "aws_verifiedaccess_trust_provider" "${vn}_device" {\n  policy_reference_name      = "device"\n  trust_provider_type        = "device"\n  device_trust_provider_type = "${t}"\n${t === "jamf" ? `  device_options {\n    tenant_id = var.jamf_tenant_id\n  }\n` : ""}}\n`); att.push("device"); }
        else todo.push(`${dev.props.vendor} isn't a native Verified Access device trust provider: pass device compliance as an IdP claim and check it in the Cedar policy`); }
      att.forEach((a) => zt.push(`resource "aws_verifiedaccess_instance_trust_provider_attachment" "${vn}_${a}" {\n  verifiedaccess_instance_id       = aws_verifiedaccess_instance.${vn}.id\n  verifiedaccess_trust_provider_id = aws_verifiedaccess_trust_provider.${vn}_${a}.id\n}\n`));
      zt.push(`# Write the Cedar access policy (identity claims${att.includes("device") ? " and device posture" : ""}) in policy_document before use.\nresource "aws_verifiedaccess_group" "${vn}" {\n  verifiedaccess_instance_id = aws_verifiedaccess_instance.${vn}.id\n  description                = ${q(v.label + " applications")}\n${att.length ? `  depends_on                 = [${att.map((a) => `aws_verifiedaccess_instance_trust_provider_attachment.${vn}_${a}`).join(", ")}]\n` : ""}}\n`);
      todo.push(`Verified Access "${v.label}": add aws_verifiedaccess_endpoint for each application (needs your domain and an ACM certificate) pointing at the internal load balancer`); });

    // ---- governance ----
    if (has("org")) zt.push(`# Apply from the management account.\ndata "aws_iam_policy_document" "scp_guardrails" {\n  statement {\n    sid       = "DenyLeaveOrganization"\n    effect    = "Deny"\n    actions   = ["organizations:LeaveOrganization"]\n    resources = ["*"]\n  }\n  statement {\n    sid    = "ProtectSecurityServices"\n    effect = "Deny"\n    actions = [\n      "cloudtrail:StopLogging",\n      "cloudtrail:DeleteTrail",\n      "guardduty:DeleteDetector",\n      "guardduty:DisassociateFromAdministratorAccount",\n      "config:StopConfigurationRecorder",\n      "config:DeleteConfigurationRecorder",\n    ]\n    resources = ["*"]\n  }\n}\n`,
      `resource "aws_organizations_policy" "guardrails" {\n  name    = "zero-trust-guardrails"\n  type    = "SERVICE_CONTROL_POLICY"\n  content = data.aws_iam_policy_document.scp_guardrails.json\n}\n`,
      `variable "scp_target_id" {\n  description = "Root, OU or account ID that receives the guardrail SCP"\n  type        = string\n}\n`,
      `resource "aws_organizations_policy_attachment" "guardrails" {\n  policy_id = aws_organizations_policy.guardrails.id\n  target_id = var.scp_target_id\n}\n`);

    // ---- not generated ----
    const skip = { idc: "IAM Identity Center is enabled once per organization in the console; manage permission sets with aws_ssoadmin_* resources",
      idp: "External IdP: configure the SAML/OIDC federation in your IdP and IAM Identity Center", posture: "Device posture provider: configure in the vendor console",
      iam: "Workload IAM roles: write one least-privilege role per workload (IAM Access Analyzer can generate policies from CloudTrail)",
      nfw: "AWS Network Firewall: needs a firewall policy, rule groups and route-table changes specific to your egress design",
      seclake: "Amazon Security Lake: needs a meta-store manager role and per-source configuration (aws_securitylake_*)" };
    Object.keys(skip).forEach((t) => { if (has(t)) todo.push(skip[t]); });
    if (by("rds").concat(by("aurora")).some((d) => d.props.tls)) todo.push("Require TLS to the database with a parameter group: rds.force_ssl = 1 (PostgreSQL) or require_secure_transport = ON (MySQL)");
    if (S.nodes.some((n) => n.type === "account")) todo.push("Account boxes: this file targets one account. Deploy Security Tooling and Log Archive resources with provider aliases (assume_role) or AWS Control Tower");
    if (zt.length) out.push("# ---- Zero Trust ----\n", ...zt);
  };
})();
