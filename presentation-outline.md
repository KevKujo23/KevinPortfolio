# Presentation Outline — AWS Services: Satisfaction Meter
**Audience**: Professors / Graders
**Tone**: Design-decision-forward; emphasise architectural reasoning and trade-offs
**Status**: Updated to reflect full project brief (multi-channel capture, email + SMS, analytics dashboards) per architecture design session.

---

## Slide 1 — Title

**Satisfaction Meter**
*Emotion-Driven Marketing via AWS*

- Course / semester context
- Team members (6 developers, one shared AWS account)
- One-line pitch: *A customer's image is captured in-store, on mobile, or on the web → we detect their mood → we send a personalised email or SMS, and feed the data into a marketing analytics dashboard.*

---

## Slide 2 — Problem Statement & Scope

- Traditional marketing blasts ignore customer emotional state at the moment of engagement.
- Satisfaction Meter reads the customer's facial emotion in real time and matches the marketing message to that mood (e.g. happy → request a review, sad → send a discount voucher).
- **Scope (full project brief):**
  - **Capture**: in-store kiosk/camera, mobile app (iOS/Android), web upload
  - **Channels**: transactional email (SES) and SMS (SNS / Pinpoint)
  - **Backend analytics**: emotion trends, campaign performance, channel ROI dashboards
  - **Single AWS region**: `ap-southeast-1` (Singapore)
  - **Security**: authenticated mobile/web clients, encrypted data at rest and in transit, least-privilege IAM
- **Implementation note**: the team will deliver a phased rollout — Phase 1 is the web + email path (the original scoped MVP); Phases 2–3 layer in mobile, in-store, SMS, and the analytics pipeline. This outline documents the **target full architecture** for the assignment.

---

## Slide 3 — High-Level Architecture Diagram

*Reference the standalone diagram artifact: `satisfaction-meter-architecture.svg` / `.pdf` / `.png` / `.mmd`. Eight numbered layers, plus cross-cutting Security and Observability sidebars and a DevOps/IaC bottom row.*

**The 8 layers, top to bottom:**

```
① CAPTURE        [In-store Kiosk] [Mobile App] [Web App]
                          │  (1) HTTPS request
                          ▼
② EDGE & AUTH    [CloudFront] → [WAF] → [Cognito] → [API Gateway]
                          │  (2) POST /upload (JWT-authorized)
                          ▼
③ INGESTION      [Lambda: URL Generator] → presigned PUT → [S3 Raw Images Bucket]
                          │  (3) S3 ObjectCreated event
                          ▼
④ DETECTION      [Lambda: Rek Handler] ↔ [Amazon Rekognition DetectFaces]
                          │  (4) PutItem dominant emotion + scores
                          ▼
⑤ PERSISTENCE    [DynamoDB: submissions] [DynamoDB: templates] [DynamoDB: campaigns]
                          │  (5) Streams trigger
                          ▼
⑥ MESSAGING      [Lambda: Dispatcher] → [SES Email] / [SNS / Pinpoint SMS] → Customer
                          │  (DDB Streams → Firehose)
                          ▼
⑦ ANALYTICS      [Streams] → [Firehose] → [S3 Data Lake] → [Glue] → [Athena] → [QuickSight]

⑧ DEVOPS / IaC   [GitHub] → [GitHub Actions] →OIDC→ [AWS CDK] → [CloudFormation] → all stacks
```

**Cross-cutting**: IAM (least-privilege roles), KMS (encryption), SSM Parameter Store (config), WAF (edge protection), CloudWatch (logs/metrics/alarms), X-Ray (tracing), CloudTrail (audit).

**Key design principle**: images never pass through a server proxy — they go directly from the client (browser, mobile app, or kiosk) to S3 via a presigned URL. This keeps Lambda stateless and avoids unnecessary data transfer costs.

---

## Slide 4 — Service Map (Full Stack at a Glance)

| Layer | AWS Service | Role |
|---|---|---|
| Capture (clients) | Mobile SDK + Web (S3/CloudFront-hosted) | Image capture from kiosk, mobile app, or browser |
| Edge / CDN | Amazon CloudFront | TLS termination, edge caching, global entry point |
| Edge / Security | AWS WAF | Managed rule groups (SQLi, XSS, bots), rate limiting |
| Identity | Amazon Cognito | User pools, JWT-based auth for mobile + web clients |
| API | Amazon API Gateway (REST) | Endpoints: `POST /upload`, `GET /results`, `GET /dashboard-data` |
| Ingestion | AWS Lambda + Amazon S3 | Presigned URL generation, direct client-to-S3 upload |
| Emotion Detection | AWS Lambda + Amazon Rekognition | S3-event-triggered `DetectFaces`, dominant-emotion extraction |
| Persistence | Amazon DynamoDB (3 tables) | `submissions`, `templates`, `campaigns` — TTL-based 30-day expiry on submissions |
| Messaging — Email | AWS Lambda + Amazon SES | Templated transactional email |
| Messaging — SMS | AWS Lambda + Amazon SNS / Pinpoint | SMS delivery to opt-in customer phones |
| Analytics — CDC | DynamoDB Streams | Change-data-capture from operational tables |
| Analytics — Stream | Amazon Kinesis Data Firehose | Buffered, columnar (Parquet) delivery to data lake |
| Analytics — Lake | Amazon S3 (data lake bucket) | Partitioned by date / channel |
| Analytics — Catalog/ETL | AWS Glue | Schema crawler + ETL transformations |
| Analytics — Query | Amazon Athena | Serverless SQL over S3 |
| Analytics — BI | Amazon QuickSight | Dashboards: emotion mix, CTR, channel ROI, campaign trends |
| Encryption | AWS KMS | Customer-managed keys for sensitive tables and lake |
| Config / Secrets | SSM Parameter Store | SecureString runtime config |
| Identity & Access | AWS IAM | Least-privilege role per Lambda |
| Infrastructure as Code | AWS CDK (TypeScript) | Five stacks: `capture`, `inference`, `messaging`, `api`, `analytics` |
| CI/CD | GitHub Actions + IAM OIDC | Push to `main` → synth → test → deploy; no stored AWS credentials |
| Observability — Logs | Amazon CloudWatch Logs | Structured JSON logs from every Lambda + API Gateway |
| Observability — Metrics | Amazon CloudWatch Metrics + Alarms | Lambda errors, latency p99, SES bounces, SNS delivery failures |
| Observability — Tracing | AWS X-Ray | End-to-end request tracing across Lambdas |
| Observability — Audit | AWS CloudTrail | Audit log for all AWS API activity |

**Service count**: 18+ AWS services in the full architecture (vs. 8 in the original scoped MVP).

---

## Slide 5 — Ingestion Layer: API Gateway + Lambda + S3 (Multi-Channel)

### What it does
The front end (web, mobile, or kiosk) calls a REST endpoint (`POST /upload`) to obtain a **presigned S3 PUT URL**. The client then uploads the image bytes directly to S3 — no Lambda handles the image bytes themselves.

### Why these services
- **API Gateway**: managed HTTP front door — no servers to run, scales automatically, integrates natively with Cognito for JWT validation.
- **Cognito (mobile/web)**: user pools issue JWTs; API Gateway validates them as a Cognito authorizer. The kiosk uses a device-scoped IAM role via Cognito Identity Pool.
- **Presigned URLs**: offload the large file transfer to S3's infrastructure rather than routing it through Lambda (Lambda has a 6 MB payload limit on API Gateway proxy responses; a photo can easily exceed this). Also eliminates per-byte Lambda compute cost.
- **S3 (SSE-S3 / KMS, AES-256)**: object storage for raw images. KMS customer-managed keys enabled on the lake and submissions table; SSE-S3 (no extra cost) for the short-lived raw upload bucket.

### Key design decisions
- Lifecycle rule: **delete raw upload objects after 30 days** — images are sensitive personal data; once emotion features are extracted they need not persist.
- No public access on the bucket — the presigned URL grants time-limited, single-object PUT permission only.
- `submissionId` (UUID) generated server-side at presigned URL request time, used as S3 key prefix and DynamoDB primary key.
- `channel` attribute (`web` / `mobile` / `kiosk`) recorded on the submission record for downstream analytics.

---

## Slide 6 — Processing Layer: Lambda + Amazon Rekognition

### What it does
An **S3 ObjectCreated event** triggers a Lambda function automatically when an image lands in the bucket. The Lambda calls Rekognition `DetectFaces`, receives confidence scores for each detected emotion, selects the dominant one, and writes the result to DynamoDB.

### Why these services
- **Lambda (event-driven)**: stateless, serverless, zero idle cost — ideal for a sporadic trigger like image upload.
- **Amazon Rekognition `DetectFaces`**: purpose-built managed API for face and emotion analysis. No model training, no GPU provisioning, no ML expertise required. Returns structured confidence scores per emotion label (HAPPY, SAD, SURPRISED, ANGRY, CALM, NEUTRAL, etc.).

### Deep dive: Rekognition response handling
- The API returns an array of `FaceDetails`, each with an `Emotions` list of `{Type, Confidence}` pairs.
- Lambda sorts by `Confidence` descending and takes `Type` of index 0 → dominant emotion.
- If no face is detected (empty `FaceDetails`), the Lambda writes `dominantEmotion: "NONE"` and skips message dispatch.
- Raw face attribute bytes (bounding boxes, landmarks) are **never logged** — only the dominant emotion label and confidence scores are persisted. This separates biometric data from PII.

### Emotion → Template mapping (5 initial templates, per channel)
| Detected Emotion | Marketing Action | Default Channel |
|---|---|---|
| HAPPY | Request a product review | Email |
| SAD | Send a voucher / discount | Email + SMS |
| SURPRISED | Flash deal offer | SMS (urgency) |
| ANGRY | Apology + discount | Email |
| NEUTRAL / CALM / OTHER | General promotional offer | Email |

Channel selection is configurable per template in the `templates` DynamoDB table.

---

## Slide 7 — Messaging Layer: Email (SES) + SMS (SNS / Pinpoint)

### What it does
After DynamoDB is updated with the emotion result, a **DynamoDB Stream** triggers the Dispatcher Lambda. The Lambda looks up the matching template (keyed on emotion + channel), dispatches via the appropriate channel, and writes back delivery status to the `campaigns` table.

### Email — Amazon SES
- Templated transactional email via `SendTemplatedEmail`.
- Domain verified via DKIM + SPF records.
- For demo / sandbox mode: only verified recipient addresses can receive mail (acceptable for controlled demo audiences).
- Templates stored as **SES templates** (named, versioned) — keeps email content decoupled from application logic.

### SMS — Amazon SNS (with Pinpoint for richer use cases)
- SNS `Publish` to a phone number is the simplest path for transactional SMS.
- Pinpoint is layered in for opt-in/opt-out management, country-specific compliance, and per-campaign analytics.
- Sender ID configured per region (Singapore requires registration).
- Per-message cost varies by destination country — bounded by per-day spend cap to prevent runaway costs.

### Why SES + SNS (not Pinpoint-only or third-party)
- **SES** handles transactional email natively at lowest per-message cost; SNS handles SMS without journey/campaign overhead.
- **Pinpoint** is used for SMS opt-in management but not as the primary email engine — keeps cost surface predictable.
- Third-party ESPs (SendGrid, Twilio) break the AWS-native constraint and don't add value at this scale.

### Idempotency
- Dispatcher writes `messageId` returned by SES/SNS into the `submissions` record before marking the submission complete — ensures retries from DDB Streams don't double-send.

---

## Slide 8 — Persistence Layer: Amazon DynamoDB (3 Tables)

### What it does
Three single-purpose tables, each with a clear access pattern:

### Table 1 — `submissions` (operational, per-event)
| Attribute | Type | Notes |
|---|---|---|
| `submissionId` (PK) | String (UUID) | Generated at presigned URL request time |
| `userId` | String | Cognito sub (mobile/web) or kiosk device ID |
| `channel` | String | `web` / `mobile` / `kiosk` |
| `email` / `phone` | String | Identity anchor; never logged with face bytes |
| `s3Key` | String | S3 object path |
| `dominantEmotion` | String | e.g. `"HAPPY"` |
| `emotionScores` | Map | Full `{Type: Confidence}` map from Rekognition |
| `dispatchedAt` | ISO-8601 String | Populated by Dispatcher Lambda |
| `messageChannel` | String | `email` / `sms` actually used |
| `messageId` | String | SES or SNS message ID for idempotency |
| `templateUsed` | String | Template name |
| `timestamp` | Number (Unix epoch) | Submission time |
| `ttl` | Number (Unix epoch) | `timestamp + 30 days`; auto-deletes expired items |

### Table 2 — `templates` (configuration)
- PK: `templateId`; attributes: `emotion`, `channel`, `subject`, `body`, `version`.
- Read by Dispatcher Lambda; updated by ops team / marketing.

### Table 3 — `campaigns` (delivery tracking)
- PK: `campaignId`, SK: `submissionId`.
- Tracks delivered / opened / clicked / bounced counts; aggregated for QuickSight via DDB Streams.

### Why DynamoDB
- Pure key-value access patterns; no relational joins required.
- Native TTL on `submissions` — zero-cost auto-purge.
- DynamoDB Streams provides change-data-capture into the analytics pipeline with no polling.
- Contrast with Aurora/RDS: relational engines add baseline ACU/instance cost and aren't needed for these access patterns.

---

## Slide 9 — Results & Dashboard APIs

### `GET /results/{submissionId}`
- Reads the submissions table by PK.
- Returns emotion result, channel used, message status, template name.
- Cognito-authorized — caller must own the `userId` on the record (or be an admin).

### `GET /dashboard-data`
- Admin-only endpoint (Cognito group: `marketing-team`).
- Lambda queries Athena via the Athena SDK for pre-canned reports (emotion distribution this week, CTR by channel, top-performing template).
- Result cached in API Gateway for 60s to bound query cost.
- QuickSight is the primary dashboard surface; this API is for embedding selected metrics in third-party tools.

### Closes the loop
- Submit → poll GET `/results` → confirm fields populated → confirm Athena reflects the event in the data lake within ~5 minutes (Firehose buffer interval).

---

## Slide 10 — Analytics Layer: Stream → Lake → BI

### What it does
DynamoDB Streams capture every write to `submissions` and `campaigns`. Kinesis Firehose buffers and writes Parquet files to the S3 data lake. Glue crawls the lake to maintain a schema catalog. Athena runs SQL ad-hoc; QuickSight visualises the result for the marketing team.

### Why this pipeline (not direct DDB → QuickSight)
- DynamoDB is optimised for OLTP, not analytics scans — cross-table aggregation directly on DDB is slow and consumes RCU.
- A separate analytics path keeps operational and analytical workloads isolated (CQRS-style separation).
- Parquet on S3 is the cheapest, most queryable format at scale.

### Dashboards delivered in QuickSight
- **Emotion mix over time** — stacked area chart, by day/week/month.
- **Channel performance** — email vs. SMS open/click/conversion rates.
- **Template ROI** — which emotion → template pairing drives the most engagement.
- **Capture-source breakdown** — kiosk vs. mobile vs. web, by region.
- **Funnel** — submission → emotion detected → message dispatched → opened → clicked.

### Key design decisions
- **Firehose buffer**: 5 minutes / 5 MB whichever first — balances freshness with file count on S3.
- **Partitioning**: `s3://lake/submissions/year=YYYY/month=MM/day=DD/channel=X/` — keeps Athena scans cheap (partition pruning).
- **Glue crawler**: scheduled once daily; catalog is the single source of truth for QuickSight datasets.

---

## Slide 11 — Infrastructure as Code: AWS CDK (TypeScript)

### What it does
CDK synthesises AWS CloudFormation templates from TypeScript code. Five stacks map to bounded contexts:

| CDK Stack | Resources it owns |
|---|---|
| `capture` | S3 raw bucket, presigned URL Lambda, API Gateway, Cognito user pool, CloudFront, WAF |
| `inference` | Rekognition-trigger Lambda, DynamoDB `submissions` + `templates` tables |
| `messaging` | SES dispatcher Lambda, SNS publisher Lambda, SES templates, `campaigns` table |
| `api` | GET results / dashboard-data Lambdas, API Gateway routes |
| `analytics` | DDB Stream → Firehose, S3 lake bucket, Glue catalog + crawler, Athena workgroup, QuickSight datasets |

### Why CDK over raw CloudFormation or Terraform
- CDK is AWS-native, TypeScript (team familiarity), and generates CloudFormation under the hood — no separate tool to install in CI.
- Higher-level constructs reduce boilerplate (e.g., `LambdaRestApi` auto-creates the integration wiring).
- Modular stacks enforce separation of concerns — changes to the messaging stack don't risk re-deploying capture infrastructure.

---

## Slide 12 — DevOps: GitHub Actions + IAM OIDC

### What it does
On push to `main`, the GitHub Actions workflow runs:
1. `cdk synth` — validate the CloudFormation output
2. Unit tests + integration tests against synthesised stacks
3. `cdk deploy --all` — deploy all five stacks

### Why OIDC (not stored AWS credentials)
- GitHub OIDC federation lets the Actions runner assume an IAM role via a signed JWT — **no AWS access key or secret key is stored in GitHub Secrets**.
- This is a security best practice: credentials cannot be leaked from a secrets store because they don't exist in one. GitHub's OIDC token is short-lived and tied to the specific repo + branch.
- IAM trust policy on the role restricts assumption to the project repo + `main` branch only.

---

## Slide 13 — Identity, Secrets & Encryption

### IAM (least-privilege per Lambda)
- Each Lambda function has its own execution role with only the permissions it needs:
  - URL Generator: `s3:PutObject` on the upload bucket only, `dynamodb:PutItem` on `submissions`.
  - Rekognition Lambda: `rekognition:DetectFaces`, `dynamodb:UpdateItem` on `submissions`, `s3:GetObject` on raw bucket.
  - Dispatcher Lambda: `ses:SendTemplatedEmail`, `sns:Publish`, `dynamodb:UpdateItem` on `submissions` + `campaigns`, `dynamodb:GetItem` on `templates`.
  - Results Lambda: `dynamodb:GetItem` on `submissions`.
  - Dashboard Lambda: `athena:StartQueryExecution`, `athena:GetQueryResults`, `s3:GetObject` on Athena results bucket.
- No Lambda has `*` action or `*` resource — isolation limits blast radius if a function is compromised.

### KMS
- Customer-managed key (CMK) for the `submissions` table and S3 data lake — sensitive customer data warrants tenant-controlled keys.
- Raw upload bucket uses SSE-S3 (free) — short TTL means lower risk profile.
- Key rotation enabled (annual).

### SSM Parameter Store (Standard tier)
- Stores runtime configuration (SES sender address, SNS sender ID, table names, QuickSight account ID) as SecureString parameters.
- Free at Standard tier.
- Secrets Manager evaluated and excluded for cost-stable parameters; reserved for any future credentials with rotation requirements.

---

## Slide 14 — Observability: Amazon CloudWatch + X-Ray + CloudTrail

### What it monitors
- **CloudWatch Logs**: all Lambda + API Gateway logs in structured JSON, 30-day retention.
- **CloudWatch Metrics + Alarms**:
  - Lambda invocation count, error rate, duration (p50/p99) — alerts if Rekognition Lambda errors spike.
  - Rekognition latency per `DetectFaces` call (custom metric emitted from Lambda).
  - SES delivery, bounce, complaint rates (published to CloudWatch natively).
  - SNS SMS delivery success / failure rates.
  - API Gateway 4xx/5xx rates, latency.
- **AWS X-Ray**: distributed tracing across the full request path — pinpoints which Lambda or external call is the slowest in the chain.
- **AWS CloudTrail**: audit log for every AWS API call. Single-region trail, delivered to a separate logging bucket.

### Why this stack (not Datadog, Grafana Cloud, etc.)
- CloudWatch is the native AWS observability layer — Lambda, DynamoDB, SES, SNS publish metrics here automatically with no agent required.
- Generous free-tier coverage for the metrics, alarms, and trace volumes expected at semester scale.
- Third-party tools would require exporting telemetry, adding cost and an external dependency not justified at this scale.

---

## Slide 15 — Cost & Free-Tier Analysis

The full-brief architecture is **no longer a $0 deployment** — but cost is bounded and predictable. The team's deployment plan is to keep features behind feature flags and only enable cost-incurring services (QuickSight authors, KMS CMKs, SMS sending) when needed for evaluation demos.

### Free-tier-covered services (effectively $0 at semester scale)

| Service | Free Tier Allowance | Expected Usage | Cost |
|---|---|---|---|
| Amazon S3 (raw + lake) | 5 GB storage / month | < 2 GB total | $0 |
| Amazon Rekognition | 5,000 `DetectFaces` calls / month (12 months) | < 500 calls | $0 |
| AWS Lambda | 1M requests + 400k GB-s compute / month | < 20k invocations | $0 |
| Amazon API Gateway | 1M REST API calls / month (12 months) | < 20k calls | $0 |
| Amazon DynamoDB | 25 GB + 25 WCU + 25 RCU / month (always free) | Negligible | $0 |
| Amazon SES | 3,000 messages / month (in-region Lambda send) | < 500 emails | $0 |
| Amazon CloudFront | 1 TB / month for 12 months | < 1 GB | $0 |
| Amazon Cognito | 50,000 MAU (always free) | < 100 MAU | $0 |
| Kinesis Firehose | (no native free tier; very low cost) | < 100 MB/month | < $0.01 |
| AWS Glue | 1M objects + free crawlers below threshold | Minimal | $0 |
| Amazon Athena | $5 per TB scanned | < 1 GB scans | < $0.01 |
| AWS X-Ray | 100k traces recorded / month | < 5k traces | $0 |
| CloudWatch | 10 custom metrics, 5 alarms / month | < 10 | $0 |
| AWS CloudTrail | One management-event trail free | One trail | $0 |
| SSM Parameter Store | 10,000 parameters (Standard) | < 30 | $0 |
| IAM | Always free | — | $0 |
| GitHub Actions | 2,000 CI minutes / month (free plan) | < 200 mins | $0 |

### Services that add unavoidable cost in the full architecture

| Service | Cost Driver | Mitigation |
|---|---|---|
| **AWS WAF** | ~$5 / web ACL / month + $1 / rule + $0.60 / M requests | Enabled only during graded demo windows; disabled afterwards |
| **Amazon SNS — SMS** | Per-message, varies by country (~$0.0065 / SMS to PH) | Per-day spend cap configured at $1 / day; sandbox for unverified numbers in dev |
| **Amazon QuickSight** | $9 / author / month (Standard); reader sessions extra | One author seat for the marketing demo; readers limited to course evaluators |
| **AWS KMS — CMK** | $1 / customer-managed key / month | Two CMKs (lake + submissions table); ~$2 / month |
| **Amazon Pinpoint** *(optional)* | Per-MAU + per-message campaign cost | Opt-in only when richer SMS journey features are demoed; not deployed by default |

**Estimated steady-state monthly cost (full architecture, low-volume demo)**: roughly **$15–$25 / month** when WAF, QuickSight, KMS, and small SMS volume are all enabled simultaneously. For a 3-month semester demo period, total bounded cost is **< $75**.

**Services explicitly excluded:**
- **Amazon Aurora / RDS** — no relational workload; DynamoDB suffices.
- **VPC Endpoints** — hourly charge; not required since there's no compliance need to keep traffic off the public internet at this scale.
- **Amazon Macie** — sensitive data discovery is overkill for a demo dataset; data minimisation policies handle this requirement at design level.

---

## Slide 16 — Design Trade-offs & Lessons Learned

| Decision | Alternative Considered | Why We Chose What We Did |
|---|---|---|
| Multi-channel capture (kiosk + mobile + web) | Web only | Brief explicitly requires multi-channel; presigned URL pattern works identically across all three so cost of supporting them is low |
| SES (email) + SNS (SMS) | Pinpoint-only for both | Pinpoint adds journey-builder cost for the email path that we don't need; SES + SNS gives lowest per-message cost on each channel |
| DDB Streams → Firehose → S3 → Athena → QuickSight | Direct QuickSight on DynamoDB | DDB is OLTP-optimised; cross-row aggregation against it is slow and burns RCU. CQRS-style split is industry-standard |
| QuickSight | Custom-built React dashboard on `GET /dashboard-data` | Build effort vs. monthly fee — QuickSight ships features (drilldowns, scheduled emails, embedding) for $9/author that would take weeks to replicate |
| Cognito (User + Identity Pools) | API key per client | Brief requires per-customer identity; API keys don't support per-user authorization or revocation |
| KMS CMK for sensitive tables, SSE-S3 for raw uploads | All KMS, or all SSE-S3 | Mixed: pay for control where data is sensitive long-term; save money where data has 30-day TTL anyway |
| DynamoDB over RDS/Aurora | Aurora Serverless | Pure key-value access patterns; no joins; Aurora has minimum ACU cost |
| SSM Parameter Store over Secrets Manager | Secrets Manager | Secrets Manager costs $0.40/secret/month; SSM Standard is free for non-rotating config |
| GitHub Actions + OIDC over CodePipeline | AWS CodePipeline | Team is GitHub-native; OIDC eliminates credential storage; CodePipeline adds per-pipeline cost |
| Presigned URL (direct client → S3) over Lambda proxy | Lambda receives image and forwards to S3 | Lambda has 6 MB payload cap via API Gateway; presigned approach is unlimited, lower latency, lower cost |
| Five CDK stacks (one per bounded context) | Monolithic CDK app | Modular stacks reduce re-deployment blast radius and clarify ownership across the 6-developer team |
| WAF only enabled during demo windows | WAF always-on | $5/ACL/month is the largest single non-data cost; for a demo we don't need 24/7 protection |

---

## Slide 17 — Summary

- **18+ AWS services** working together in a fully serverless, event-driven pipeline.
- **Multi-channel capture** (kiosk, mobile, web) → **dual-channel delivery** (email + SMS) → **closed-loop analytics** (QuickSight dashboards on a S3 data lake).
- **End-to-end target latency**: image upload → emotion detected → personalised message dispatched in **< 5 seconds**; dashboard reflection in **< 5 minutes** (Firehose buffer interval).
- **Bounded cost**: $0 baseline (free-tier-covered services), with ~$15–$25/month when demo-only services (WAF, QuickSight, KMS, SMS) are enabled.
- **Every design choice traceable** to a constraint — security (Cognito, IAM, KMS, WAF), cost (SSM over Secrets Manager, SSE-S3 over CMK on short-TTL data), latency (presigned URLs, event-driven Lambda), or scope (multi-channel because the brief requires it).

*"The goal wasn't to use the most AWS services — it was to use exactly the right ones for the brief."*

---

## Appendix A — Data Flow Sequence (detailed)

1. User opens client (kiosk / mobile app / web) → authenticates via Cognito → captures or selects image.
2. Client calls `POST /upload` on API Gateway with JWT in `Authorization` header.
3. API Gateway validates JWT against Cognito, invokes URL Generator Lambda.
4. Lambda creates a UUID `submissionId`, writes a pending DynamoDB record (`userId`, `email`/`phone`, `s3Key`, `channel`, `timestamp`, `ttl`), returns presigned S3 PUT URL + `submissionId`.
5. Client PUTs image bytes directly to S3 using the presigned URL.
6. S3 fires `ObjectCreated` notification → invokes Rekognition Lambda.
7. Rekognition Lambda calls `DetectFaces` → sorts emotion scores → determines dominant emotion → updates DynamoDB record with `dominantEmotion` + `emotionScores`.
8. DynamoDB Stream record triggers Dispatcher Lambda.
9. Dispatcher reads matching template from `templates` table, decides channel (email / SMS), calls SES `SendTemplatedEmail` or SNS `Publish` → writes `dispatchedAt`, `messageChannel`, `messageId` back to `submissions`, increments counters in `campaigns`.
10. End user receives personalised email or SMS.
11. Stream record from the update is also delivered via Firehose to the S3 data lake (Parquet).
12. Glue crawler updates the catalog (daily); Athena queries reflect the event.
13. QuickSight dashboards refresh on schedule for the marketing team.
14. Any caller can query `GET /results/{submissionId}` → Lambda reads DynamoDB → returns JSON response.
15. Admin-only `GET /dashboard-data` runs pre-canned Athena queries for embedding metrics elsewhere.

---

## Appendix B — IAM Role Summary

| Lambda | Key Permissions |
|---|---|
| URL Generator | `s3:PutObject` (raw bucket, scoped to `submissionId/*`) · `dynamodb:PutItem` on `submissions` |
| Rekognition Handler | `rekognition:DetectFaces` · `dynamodb:UpdateItem` on `submissions` · `s3:GetObject` on raw bucket |
| Dispatcher | `ses:SendTemplatedEmail` · `sns:Publish` · `dynamodb:UpdateItem` on `submissions` + `campaigns` · `dynamodb:GetItem` on `templates` |
| Results Reader | `dynamodb:GetItem` on `submissions` |
| Dashboard | `athena:StartQueryExecution` · `athena:GetQueryResults` · `s3:GetObject`/`PutObject` on Athena results bucket · `glue:GetTable` |

All roles also have the standard `logs:CreateLogGroup` / `logs:PutLogEvents` for CloudWatch Logs — granted via the AWS-managed `AWSLambdaBasicExecutionRole` — plus `xray:PutTraceSegments` for X-Ray.

---

## Appendix C — Today's Progress Log

**Date**: April 27, 2026

- Architecture design session completed.
- Full-brief architecture diagram produced in four formats:
  - `satisfaction-meter-architecture.svg` — vector, infinitely scalable, primary embed format.
  - `satisfaction-meter-architecture.pdf` — vector PDF for print or Illustrator/Inkscape edits.
  - `satisfaction-meter-architecture.png` — raster preview at 1920px width.
  - `satisfaction-meter-architecture.mmd` — Mermaid source for Lucidchart / draw.io / mermaid.live import.
- Service count expanded from 8 (scoped MVP) to 18+ (full brief).
- Cost model updated: $0 → ~$15–$25/month when demo-only services enabled.
- This presentation outline updated to reflect the full-brief architecture; original scoped MVP retained as Phase 1 of the implementation roadmap.
