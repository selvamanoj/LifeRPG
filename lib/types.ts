export type HeroAttribute =
  | "strength"
  | "intellect"
  | "discipline"
  | "creativity"
  | "social";

export type TaskDifficulty = "trivial" | "easy" | "normal" | "hard" | "epic";
export type TaskStatus = "active" | "completed" | "archived";
export type ItemKind = "badge" | "title" | "theme" | "consumable";
export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export type Profile = {
  id: string;
  display_name: string;
  avatar_key: string;
  level: number;
  total_xp: number;
  gold: number;
  streak_count: number;
  last_quest_date: string | null;
  timezone: string;
  equipped_theme: string;
  equipped_title: string | null;
  equipped_badge: string | null;
  created_at: string;
  updated_at: string;
};

export type Attributes = {
  user_id: string;
  strength: number;
  intellect: number;
  discipline: number;
  creativity: number;
  social: number;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  attribute: HeroAttribute;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: ItemKind;
  rarity: ItemRarity;
  gold_cost: number;
  min_level: number;
  effect: Record<string, unknown>;
  created_at: string;
};

export type InventoryRow = {
  id: string;
  user_id: string;
  item_id: string;
  qty: number;
  acquired_at: string;
  item_catalog: CatalogItem;
};

export type ActivityEvent = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type CompleteTaskResult = {
  task_id: string;
  title: string;
  xp: number;
  gold: number;
  attribute: HeroAttribute;
  attribute_pts: number;
  streak: number;
  level: number;
  previous_level: number;
  total_xp: number;
  leveled_up: boolean;
  levels_gained: number[];
  granted_items: { slug: string; name: string; kind: string; rarity: string }[];
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile };
      attributes: { Row: Attributes };
      tasks: { Row: Task };
      item_catalog: { Row: CatalogItem };
      activity_events: { Row: ActivityEvent };
    };
    Functions: {
      complete_task: {
        Args: { p_task_id: string };
        Returns: CompleteTaskResult;
      };
      purchase_item: {
        Args: { p_item_id: string };
        Returns: { slug: string; name: string; kind: string; gold_spent: number };
      };
      equip_item: {
        Args: { p_item_id: string };
        Returns: { slug: string; kind: string };
      };
      update_hero_identity: {
        Args: { p_display_name: string; p_timezone: string };
        Returns: null;
      };
      xp_required_for_level: { Args: { n: number }; Returns: number };
    };
  };
};
