import { z } from "zod";
import { isNonexistentLocalTime } from "@/lib/astro/time";

// Partagé entre la création (POST /api/profiles) et la modification
// (PUT /api/profiles/[id]) : les deux routes doivent accepter et valider
// exactement les mêmes champs de naissance, DST compris, pour qu'un profil
// modifié ne puisse pas se retrouver dans un état qu'une création refuserait.
export const profileInputSchema = z
  .object({
    label: z.string().trim().min(1, "Nom requis").max(80),
    isSelf: z.boolean().optional().default(false),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
    birthTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Heure invalide")
      .nullable()
      .optional(),
    timeUnknown: z.boolean().optional().default(false),
    locationName: z.string().trim().min(1, "Lieu requis").max(200),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    // Un fuseau non reconnu par l'ICU du runtime plantait plus loin, au calcul
    // du thème (birthInputToUtc dans lib/astro/time.ts lève une Error brute) :
    // autant le refuser ici avec un message clair plutôt que de laisser
    // remonter une 500 la première fois que ce profil sert à un calcul.
    tzName: z
      .string()
      .trim()
      .min(1, "Fuseau horaire requis")
      .refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), "Fuseau horaire invalide"),
  })
  .refine(
    (data) =>
      data.timeUnknown ||
      !data.birthTime ||
      !isNonexistentLocalTime({
        date: data.birthDate,
        time: data.birthTime,
        tzName: data.tzName,
        latitude: data.latitude,
        longitude: data.longitude,
      }),
    {
      message:
        "Cette heure n'existe pas à cet endroit ce jour-là (passage à l'heure d'été : l'horloge saute directement à l'heure suivante). Vérifiez l'heure de naissance.",
      path: ["birthTime"],
    }
  );

export type ProfileInput = z.infer<typeof profileInputSchema>;
