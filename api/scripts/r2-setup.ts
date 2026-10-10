/**
 * One-time setup for the R2 bucket, using the R2_* settings in .env:
 * - CORS, so browsers on CORS_ORIGINS can PUT photos with signed URLs.
 * - A lifecycle rule that deletes unprocessed originals under incoming/
 *   after a day (uploads that were started but never completed).
 *
 * Safe to re-run. Usage: npm run r2:setup
 */
import "dotenv/config";
import { PutBucketCorsCommand, PutBucketLifecycleConfigurationCommand, S3Client } from "@aws-sdk/client-s3";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, CORS_ORIGINS } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error("Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET in .env first.");
  process.exit(1);
}
const origins = (CORS_ORIGINS ?? "http://localhost:3000").split(",").map((o) => o.trim()).filter(Boolean);

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ["PUT", "GET"],
          AllowedHeaders: ["content-type"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);
console.log(`CORS: uploads allowed from ${origins.join(", ")}`);

await client.send(
  new PutBucketLifecycleConfigurationCommand({
    Bucket: R2_BUCKET,
    LifecycleConfiguration: {
      Rules: [
        {
          ID: "delete-abandoned-uploads",
          Status: "Enabled",
          Filter: { Prefix: "incoming/" },
          Expiration: { Days: 1 },
        },
      ],
    },
  }),
);
console.log("Lifecycle: unprocessed uploads under incoming/ are deleted after 1 day");
