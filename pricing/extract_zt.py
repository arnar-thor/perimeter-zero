"""Perimeter Zero: stream AWS Price List regional CSV offer files for one region and extract the
zero-trust service price keys (first paid on-demand tier).  usage: extract_zt.py <region> -> zt/<region>.json"""
import csv, io, json, os, re, sys, urllib.request, urllib.error
HERE = os.path.dirname(os.path.abspath(__file__))
R = sys.argv[1]
BASE = "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/%s/current/%s/index.csv"
PFX = re.compile(r'^(?:USE\d|USW\d|UG[EW]\d|EU|EU[CWNS]\d|AP[NSE]\d|AFS\d|CA[NW]\d|SAE\d|ME[SC]\d|ILC\d|MXC\d|[a-z]{2}(?:-gov)?-[a-z]+-\d)-')
out = {"region": R, "pub": {}, "missingServices": []}; cand = {}; src = {}
def put(k, r):
    cand.setdefault(k, []).append((float(r["StartingRange"] or 0), float(r["PricePerUnit"])))
    src.setdefault(k, r["PriceDescription"][:160])
def rows(svc):
    try: resp = urllib.request.urlopen(BASE % (svc, R), timeout=300)
    except urllib.error.HTTPError as e:
        if e.code in (403, 404): out["missingServices"].append(svc); return
        raise
    f = io.TextIOWrapper(resp, encoding="utf-8")
    for _ in range(5):
        line = next(f)
        if line.startswith('"Publication Date"'): out["pub"][svc] = line.split(",")[1].strip().strip('"')
    for r in csv.DictReader(f):
        if r.get("TermType") != "OnDemand": continue
        if r.get("Region Code") and r["Region Code"] != R: continue
        r["ut"] = PFX.sub("", r.get("usageType", "")); yield r
# rules: (service, key, usage type exact, description regex or None)
RULES = {
 "AmazonVPC": [("vaAppHr","VerifiedAccess-App-Hours",None),("vaGb","VerifiedAccess-DataProcess-Bytes",None),("vaConnHr","VerifiedAccess-ConnectionHours",None),
   ("tgwAttachHr","TransitGateway-Hours",r"^TransitGatewayVPC$"),("tgwGb","TransitGateway-Bytes",r"^TransitGatewayVPC$"),
   ("vpceHr","VpcEndpoint-Hours",None),("vpceGb","VpcEndpoint-Bytes",None),
   ("latticeSvcHr","VPCLattice-Service-Hourly",None),("latticeGb","VPCLattice-DataProcessing-Bytes",None),("latticeReq","VPCLattice-RequestCount-Charged",None)],
 "AWSNetworkFirewall": [("nfwEndpointHr","Endpoint-Hour",None),("nfwGb","Traffic-GB-Processed",None)],
 "AWSCertificateManager": [("pcaMo","PaidPrivateCA",None),("pcaCert","PrivateCertificatesIssued",None),("pcaShortMo","ShortLivedCertificatePrivateCA",None),("pcaShortCert","ShortLivedCertificatesIssued",None)],
 "AmazonGuardDuty": [("gdEvent","PaidEventsAnalyzed",None),("gdLogGb","PaidEventsAnalyzed-Bytes",None),("gdS3Event","PaidS3DataEventsAnalyzed",None)],
 "AWSSecurityHub": [("shCheck","PaidComplianceCheck",None),("shFinding","OtherProduct:PaidFindingsIngestion",None)],
 "AWSConfig": [("cfgItem","ConfigurationItemRecorded",None),("cfgEval","ConfigRuleEvaluations",None)],
 "AmazonMacie": [("macieBucketDay","PaidDataInventoryEvaluation",None),("macieGb","SensitiveDataDiscovery",None)],
 "AmazonDetective": [("detGb","PaidDataAnalyzed-Bytes",None)],
 "AmazonSecurityLake": [("slNormGb","PaidNormalization-Bytes",None),("slCtGb","PaidCloudTrailEvents-Bytes",None)],
 "AWSCloudTrail": [("ctPaidEvent","PaidEventsRecorded",None),("ctDataEvent","DataEventsRecorded",None)],
 "AmazonCognito": [("cognitoEssMau","CognitoEssentialsMAU",None),("cognitoLiteMau","CognitoLiteMAU",None)],
 "AmazonCloudWatch": [("vendedLogGb","VendedLog-Bytes",None)],
}
for svc, rules in RULES.items():
    for r in rows(svc):
        for k, ut, d in rules:
            if r["ut"] == ut and (d is None or re.search(d, r.get("operation", ""))): put(k, r)
P = {}
for k, v in cand.items():
    paid = sorted(x for x in v if x[1] > 0)
    if paid: P[k] = min(paid, key=lambda x: (x[0], -x[1]))[1]
out["p"] = P; out["desc"] = src
os.makedirs(os.path.join(HERE, "zt"), exist_ok=True)
json.dump(out, open(os.path.join(HERE, "zt", "%s.json" % R), "w"), indent=0)
print(R, len(P), "keys; missing:", out["missingServices"], "absent:", sorted({k for v in RULES.values() for k,_,_ in v} - set(P)))
