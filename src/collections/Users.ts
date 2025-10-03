import {type CollectionConfig, Payload, PayloadRequest} from "payload";
import {getOrUploadMedia} from "@/lib/seed";

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    livePreview: {
      url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/docs"
          : "https://fumadocs-payloadcms.vercel.app",
      breakpoints: [{label: "Mobile", name: "mobile", width: 320, height: 568}],
    },
    useAsTitle: 'email',
  },
  fields: [
    // Email added by default
      {
        name: "roles",
        type: "select",
        defaultValue: ["user"],
        hasMany: true,
        options: [
          {label: "admin", value: "admin"},
          {label: "user", value: "user"},
        ],
        saveToJWT: true,
      },
      {name: "name", type: "text", label: "Name"},
      {
        name: "avatar",
        type: "upload",
        relationTo: "media",
        label: "Avatar",
      },
  ],
}

export async function seedUsers(payload: Payload, req: PayloadRequest) {
  payload.logger.info("👤 Uploading user avatars & inserting users...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  await Promise.all(
    [
      {
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        mediaUrl: "https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg",
        roles: ["admin", "user"],
      },
      {
        name: "Demo User",
        email: "demo@example.com",
        mediaUrl: "https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg",
        roles: ["user"],
      },
    ].map(async (user) => {
      const fileExtension = user.mediaUrl.split('.').pop();
      const media = await getOrUploadMedia(
        payload,
        req,
        user.mediaUrl,
        `${user.name.replace(/ /g, "-").toLowerCase()}-avatar.${fileExtension}`,
        `${user.name}'s Avatar`
      );

      await payload.create({
        collection: "users",
        data: {
          name: user.name,
          email: user.email,
          password: user.password || user.name.split(" ")[0].toLowerCase() || "test",
          avatar: media?.id || null,
          roles: user.roles || ["user"],
        },
      });

      payload.logger.info(`✅ Inserted user: ${user.name}`);
    })
  );
}
