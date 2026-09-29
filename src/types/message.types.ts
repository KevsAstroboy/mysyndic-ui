export interface Conversation {
  thread_id: string;
  est_groupe: boolean;
  other_user_id?: string | null;
  last_message_id?: string;
  last_message_at?: string;
  unread_count: number;
  /** Le contact est-il actuellement connecté ? (messagerie privée) */
  en_ligne?: boolean;
  contact?: { id: string; prenom: string; nom: string } | null;
  group_name?: string | null;
}

export interface Message {
  id: string;
  cite_id?: string;
  expediteur_id: string;
  destinataire_id?: string | null;
  est_groupe: boolean;
  contenu?: string | null;
  lu?: boolean;
  created_at?: string;
  expediteur?: { id: string; prenom: string; nom: string; roles?: string[] };
}

export interface MessageContact {
  id: string;
  prenom: string;
  nom: string;
  roles?: { code: string; libelle?: string }[];
  /** Première villa courante (rétrocompat). */
  villa?: { id: string; numero: string; rue?: string } | null;
  /** Toutes les villas courantes — un contact peut occuper plusieurs villas. */
  villas?: { id: string; numero: string; rue?: string }[];
  /** Cités rattachées (super admin global, contacts toutes cités). */
  cites?: string[];
}

export interface EnrichedConversation extends Conversation {
  nom?: string;
  prenom?: string;
}
