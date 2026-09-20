import { Generator } from "./generator";
import { isConfigured } from "@/lib/generate";

/**
 * Rendue à la requête, pas au build : `isConfigured()` lit une variable
 * d'environnement qui est posée au déploiement. Prérendue, la page figerait la
 * réponse du build et afficherait « clé absente » sur une instance configurée.
 */
export const dynamic = "force-dynamic";

/**
 * La page lit la configuration serveur et la passe au formulaire : le client
 * n'a jamais besoin de connaître la clé, seulement de savoir si elle existe.
 */
export default function Home() {
  return <Generator configured={isConfigured()} />;
}
