project-root/
│
├─ src/
│   ├─ types.ts          ← aici pui fișierul
│   ├─ schemas.ts        ← validările Zod
│   ├─ lib/
│   │   └─ supabaseClient.ts
│   ├─ pages/ sau app/
│   └─ ...
│
├─ package.json
└─ ...
export interface ObjectItem {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string;
}

export interface Message {
  id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  text: string;
}

export interface Feedback {
  id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  comment: string;
}
