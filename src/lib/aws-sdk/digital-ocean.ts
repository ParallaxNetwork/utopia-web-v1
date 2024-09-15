import {S3Client} from "@aws-sdk/client-s3";
import {env} from "~/env";

const spacesClient = new S3Client({
    endpoint: env.DIGITAL_OCEAN_SPACES_ORIGIN,
    region: env.DIGITAL_OCEAN_SPACES_REGION,
    forcePathStyle: false,
    credentials: {
        accessKeyId: env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
        secretAccessKey: env.DIGITAL_OCEAN_SPACES_SECRET_KEY
    }
});

export default spacesClient;