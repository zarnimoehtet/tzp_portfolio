/**
 * Database types matching `supabase/migrations`. Shaped like the output of
 * `supabase gen types typescript`, with JSON columns narrowed to app types.
 * Regenerate (and re-apply the narrowing) whenever the schema changes.
 */
import type { ImageAsset } from "@/lib/images/types";

export interface SocialLink {
  label: string;
  url: string;
}

export type InquiryStatus = "new" | "read" | "archived";

type Timestamps = { created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      albums: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          cover_photo_id: string | null;
          sort_order: number;
          is_published: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category?: string | null;
          cover_photo_id?: string | null;
          sort_order?: number;
          is_published?: boolean;
        } & Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["albums"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "albums_cover_photo_id_fkey";
            columns: ["cover_photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          album_id: string | null;
          title: string | null;
          description: string | null;
          alt_text: string | null;
          storage_key: string;
          image_url: string;
          medium_url: string;
          thumbnail_url: string;
          width: number;
          height: number;
          blur_data_url: string | null;
          sort_order: number;
          is_featured: boolean;
          is_published: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          album_id?: string | null;
          title?: string | null;
          description?: string | null;
          alt_text?: string | null;
          storage_key: string;
          image_url: string;
          medium_url: string;
          thumbnail_url: string;
          width: number;
          height: number;
          blur_data_url?: string | null;
          sort_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
        } & Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["photos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      packages: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number | null;
          currency: string;
          duration: string | null;
          cta_label: string | null;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          duration?: string | null;
          cta_label?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          sort_order?: number;
        } & Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
        Relationships: [];
      };
      package_features: {
        Row: {
          id: string;
          package_id: string;
          feature: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          package_id: string;
          feature: string;
          sort_order?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["package_features"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          content: string;
          avatar: ImageAsset | null;
          sort_order: number;
          is_published: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          role?: string | null;
          content: string;
          avatar?: ImageAsset | null;
          sort_order?: number;
          is_published?: boolean;
        } & Partial<Timestamps>;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
      about: {
        Row: {
          id: boolean;
          name: string;
          headline: string | null;
          introduction: string | null;
          biography: string | null;
          experience: string | null;
          years_experience: number | null;
          specialties: string[];
          personal_message: string | null;
          profile_image: ImageAsset | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["about"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["about"]["Row"]>;
        Relationships: [];
      };
      contact_settings: {
        Row: {
          id: boolean;
          email: string | null;
          phone: string | null;
          location: string | null;
          availability: string | null;
          instagram: string | null;
          facebook: string | null;
          tiktok: string | null;
          whatsapp: string | null;
          other_links: SocialLink[];
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["contact_settings"]["Row"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: boolean;
          photographer_name: string;
          logo: ImageAsset | null;
          favicon: ImageAsset | null;
          hero_image: ImageAsset | null;
          hero_title: string;
          hero_subtitle: string | null;
          primary_color: string;
          secondary_color: string;
          font_preset: string;
          template: string;
          seo_title: string | null;
          seo_description: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          event_type: string | null;
          event_date: string | null;
          package_name: string | null;
          message: string;
          status: InquiryStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          package_name?: string | null;
          message: string;
          status?: InquiryStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      reorder_items: {
        Args: { p_table: string; p_ids: string[] };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
