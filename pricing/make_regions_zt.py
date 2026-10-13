"""Perimeter Zero: merge the zero-trust service prices extracted by extract_zt.py (pricing/zt/<code>.json)
into the regional snapshots in src/data/regions/<code>.json, in place. The base service prices already in those
files (EC2, RDS, ALB, ...) come from the Architect's Desk extractor and are kept unchanged."""
import json, glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
AD = OUT = os.path.join(HERE, "..", "src", "data", "regions")
import datetime
KEYS = ["vaAppHr","vaGb","tgwAttachHr","tgwGb","vpceHr","vpceGb","latticeSvcHr","latticeGb","latticeReq","nfwEndpointHr","nfwGb",
        "pcaMo","pcaCert","pcaShortMo","pcaShortCert","gdEvent","gdLogGb","gdS3Event","shCheck","shFinding","cfgItem","cfgEval",
        "macieBucketDay","macieGb","detGb","slNormGb","slCtGb","ctPaidEvent","ctDataEvent","cognitoEssMau","cognitoLiteMau","vendedLogGb"]
SVC = {"lattice": ("latticeSvcHr", "Amazon VPC Lattice"), "va": ("vaAppHr", "AWS Verified Access"), "macie": ("macieBucketDay", "Amazon Macie"),
       "detective": ("detGb", "Amazon Detective"), "seclake": ("slNormGb", "Amazon Security Lake"), "tgw": ("tgwAttachHr", "AWS Transit Gateway"),
       "nfw": ("nfwEndpointHr", "AWS Network Firewall"), "pca": ("pcaMo", "AWS Private CA"), "guardduty": ("gdEvent", "Amazon GuardDuty"),
       "sechub": ("shCheck", "AWS Security Hub"), "config": ("cfgItem", "AWS Config"), "cognito": ("cognitoEssMau", "Amazon Cognito")}
idx = json.load(open(AD + "/index.json")); gaps = {}
for r in idx["regions"]:
    c = r["code"]; o = json.load(open(f"{AD}/{c}.json")); z = json.load(open(os.path.join(HERE, "zt", f"{c}.json")))
    for k in KEYS: o[k] = z["p"].get(k)
    o["meta"]["offerPublicationDates"].update(z["pub"])
    if "(first paid tier)" not in o["meta"]["source"]:
        o["meta"]["source"] = o["meta"]["source"].replace("on-demand terms", "on-demand terms (first paid tier)")
    for t in SVC: o["meta"]["unavailable"].pop(t, None)
    missing = []
    for t, (k, nm) in SVC.items():
        if o[k] is None:
            missing.append(nm)
            o["meta"]["unavailable"][t] = (f"{nm} has no on-demand price in the AWS Price List for {o['meta']['name']} ({c}), so this tool treats it as not offered there.")
    o["meta"]["notes"]["zt"] = ("IAM, IAM Identity Center, AWS Organizations/SCPs, security groups and S3/DynamoDB gateway endpoints have no AWS charge. "
                                "Third-party identity and device-posture products are licensed separately and are not estimated.")
    gaps[c] = missing
    json.dump(o, open(f"{OUT}/{c}.json", "w"), separators=(",", ":"))
idx["fetched"] = datetime.date.today().isoformat()
json.dump(idx, open(OUT + "/index.json", "w"), separators=(",", ":"))
json.dump(gaps, open(os.path.join(HERE, "gaps.json"), "w"), indent=1)
for c, m in gaps.items(): print(c, ", ".join(m) or "all priced")
