export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          campaign_slug: string | null
          collection_id: string | null
          created_at: string
          event_type: string
          id: number
          path: string | null
          product_id: string | null
          query: string | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          campaign_slug?: string | null
          collection_id?: string | null
          created_at?: string
          event_type: string
          id?: never
          path?: string | null
          product_id?: string | null
          query?: string | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          campaign_slug?: string | null
          collection_id?: string | null
          created_at?: string
          event_type?: string
          id?: never
          path?: string | null
          product_id?: string | null
          query?: string | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean
          countdown_to: string | null
          created_at: string
          ends_at: string | null
          id: string
          link: string | null
          mobile_text: string | null
          priority: number
          starts_at: string | null
          text: string
        }
        Insert: {
          active?: boolean
          countdown_to?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          link?: string | null
          mobile_text?: string | null
          priority?: number
          starts_at?: string | null
          text: string
        }
        Update: {
          active?: boolean
          countdown_to?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          link?: string | null
          mobile_text?: string | null
          priority?: number
          starts_at?: string | null
          text?: string
        }
        Relationships: []
      }
      campaign_products: {
        Row: {
          campaign_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          campaign_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          campaign_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          banner: string | null
          countdown_message: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          description: string | null
          ends_at: string | null
          headline: string | null
          hero_image: string | null
          id: string
          name: string
          show_countdown: boolean
          slug: string
          starts_at: string | null
          status: string
          type: string
        }
        Insert: {
          banner?: string | null
          countdown_message?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          ends_at?: string | null
          headline?: string | null
          hero_image?: string | null
          id?: string
          name: string
          show_countdown?: boolean
          slug: string
          starts_at?: string | null
          status?: string
          type?: string
        }
        Update: {
          banner?: string | null
          countdown_message?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          ends_at?: string | null
          headline?: string | null
          hero_image?: string | null
          id?: string
          name?: string
          show_countdown?: boolean
          slug?: string
          starts_at?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          published: boolean
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          published?: boolean
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          banner: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          featured: boolean
          id: string
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          starts_at: string | null
          status: string
          thumbnail: string | null
        }
        Insert: {
          banner?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          starts_at?: string | null
          status?: string
          thumbnail?: string | null
        }
        Update: {
          banner?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          starts_at?: string | null
          status?: string
          thumbnail?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          align: string
          created_at: string
          cta_label: string | null
          cta_url: string | null
          cta2_label: string | null
          cta2_url: string | null
          ends_at: string | null
          focal: string
          id: string
          image: string
          mobile_image: string | null
          overlay: number
          sort_order: number
          starts_at: string | null
          status: string
          subtitle: string | null
          title: string
          video: string | null
        }
        Insert: {
          align?: string
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          cta2_label?: string | null
          cta2_url?: string | null
          ends_at?: string | null
          focal?: string
          id?: string
          image: string
          mobile_image?: string | null
          overlay?: number
          sort_order?: number
          starts_at?: string | null
          status?: string
          subtitle?: string | null
          title: string
          video?: string | null
        }
        Update: {
          align?: string
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          cta2_label?: string | null
          cta2_url?: string | null
          ends_at?: string | null
          focal?: string
          id?: string
          image?: string
          mobile_image?: string | null
          overlay?: number
          sort_order?: number
          starts_at?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          video?: string | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          config: Json
          enabled: boolean
          id: string
          sort_order: number
          subtitle: string | null
          title: string | null
          type: string
        }
        Insert: {
          config?: Json
          enabled?: boolean
          id?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          type: string
        }
        Update: {
          config?: Json
          enabled?: boolean
          id?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          type?: string
        }
        Relationships: []
      }
      lookbook_items: {
        Row: {
          caption: string | null
          hotspots: Json
          id: string
          image: string
          lookbook_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          hotspots?: Json
          id?: string
          image: string
          lookbook_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          hotspots?: Json
          id?: string
          image?: string
          lookbook_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_items_lookbook_id_fkey"
            columns: ["lookbook_id"]
            isOneToOne: false
            referencedRelation: "lookbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbooks: {
        Row: {
          cover: string | null
          created_at: string
          description: string | null
          id: string
          slug: string
          sort_order: number
          status: string
          title: string
        }
        Insert: {
          cover?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          sort_order?: number
          status?: string
          title: string
        }
        Update: {
          cover?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          sort_order?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          name: string | null
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          name?: string | null
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          name?: string | null
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notify_requests: {
        Row: {
          consent: boolean
          contact: string
          created_at: string
          id: string
          product_id: string | null
        }
        Insert: {
          consent: boolean
          contact: string
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Update: {
          consent?: boolean
          contact?: string
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notify_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          qty: number
          size: string | null
          sku: string | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          qty?: number
          size?: string | null
          sku?: string | null
          unit_price?: number
        }
        Update: {
          color?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          qty?: number
          size?: string | null
          sku?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          campaign_slug: string | null
          city: string | null
          created_at: string
          customer_name: string | null
          id: string
          notes: string | null
          order_number: number
          phone: string | null
          session_id: string | null
          source: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          campaign_slug?: string | null
          city?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: never
          phone?: string | null
          session_id?: string | null
          source?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          campaign_slug?: string | null
          city?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: never
          phone?: string | null
          session_id?: string | null
          source?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          cost_price: number
          product_id: string
        }
        Insert: {
          cost_price?: number
          product_id: string
        }
        Update: {
          cost_price?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care: string | null
          category_id: string | null
          collection_id: string | null
          colors: string[]
          created_at: string
          description: string | null
          fabric: string | null
          fit: string | null
          focal: string
          id: string
          image_alts: string[]
          images: string[]
          is_best_seller: boolean
          is_featured: boolean
          is_new: boolean
          is_trending: boolean
          name: string
          on_sale: boolean
          price: number
          related_ids: string[]
          sale_price: number | null
          season: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sizes: string[]
          sku: string
          slug: string
          status: string
          stock: number
          stock_status: string
          subtitle: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          care?: string | null
          category_id?: string | null
          collection_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string | null
          fabric?: string | null
          fit?: string | null
          focal?: string
          id?: string
          image_alts?: string[]
          images?: string[]
          is_best_seller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_trending?: boolean
          name: string
          on_sale?: boolean
          price: number
          related_ids?: string[]
          sale_price?: number | null
          season?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sizes?: string[]
          sku: string
          slug: string
          status?: string
          stock?: number
          stock_status?: string
          subtitle?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          care?: string | null
          category_id?: string | null
          collection_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string | null
          fabric?: string | null
          fit?: string | null
          focal?: string
          id?: string
          image_alts?: string[]
          images?: string[]
          is_best_seller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_trending?: boolean
          name?: string
          on_sale?: boolean
          price?: number
          related_ids?: string[]
          sale_price?: number | null
          season?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sizes?: string[]
          sku?: string
          slug?: string
          status?: string
          stock?: number
          stock_status?: string
          subtitle?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      ranked_collections: {
        Args: { _limit?: number; _period: string }
        Returns: {
          collection_id: string
          score: number
        }[]
      }
      ranked_products: {
        Args: { _limit?: number; _metric: string }
        Returns: {
          product_id: string
          score: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
