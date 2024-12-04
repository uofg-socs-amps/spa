import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { ShibUser } from "@/lib/validations/auth";

import { env } from "@/env";

export async function getShibUserFromHeaders() {
  let shib_guid: string | null = null;
  let shib_displayName: string | null = null;
  let shib_email: string | null = null;

  if (env.DEV_ENV === "PROD") {
    shib_guid = headers().get("DH75HDYT76");
    shib_displayName = headers().get("DH75HDYT77");
    shib_email = headers().get("DH75HDYT80");
    // shib_groups = headers().get("DH75HDYT78");
  } else {
    // TODO: create a proper dev vs prod env distinction
    shib_guid = "gn32b"; // supervisor
    // shib_guid = "000-234581p"; // student
    // shib_guid = env.DEV_ID;
    shib_displayName = env.DEV_NAME;
    shib_email = env.DEV_EMAIL;
    // shib_groups = "staff;member"
  }

  console.log(">>> from shibboleth", {
    GUID: shib_guid,
    DisplayName: shib_displayName,
    Email: shib_email,
    // Groups: shib_groups?.split(";"),
  });

  const guid = z.string().parse(shib_guid);
  const displayName = z.string().parse(shib_displayName);
  const email = z.string().parse(shib_email);
  // const groups = z.string().parse(shib_groups).split(";");

  return { guid, displayName, email };
}

export async function retrieveUser(user: ShibUser) {
  const dbUser = await db.user.findFirst({ where: { id: user.guid } });
  if (dbUser) return dbUser;

  try {
    const newUser = await db.user.create({
      data: {
        id: user.guid,
        name: user.displayName,
        email: user.email,
      },
    });
    return newUser;
  } catch (e) {
    throw new Error("No valid invite found for this user");
  }
}
