export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      asset_events: {
        Row: {
          asset_id: string;
          confirmations: string[];
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          id: string;
          kind: string;
          payload: Json | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          asset_id: string;
          confirmations?: string[];
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          id?: string;
          kind: string;
          payload?: Json | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          asset_id?: string;
          confirmations?: string[];
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          id?: string;
          kind?: string;
          payload?: Json | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_events_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      asset_ownerships: {
        Row: {
          asset_id: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          share_bps: number;
          updated_at: string;
          user_id: string;
          valid_from: string;
          valid_to: string | null;
        };
        Insert: {
          asset_id: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          share_bps: number;
          updated_at?: string;
          user_id: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Update: {
          asset_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          share_bps?: number;
          updated_at?: string;
          user_id?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "asset_ownerships_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_ownerships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          bank_name: string | null;
          created_at: string;
          deleted_at: string | null;
          fx_amount_minor: number | null;
          fx_currency: string | null;
          gold_type: string | null;
          grams: number | null;
          id: string;
          kind: string;
          manual_value: number | null;
          matures_on: string | null;
          name: string;
          opened_on: string | null;
          origin: string | null;
          origin_note: string | null;
          principal: number | null;
          purchase_price: number | null;
          purchased_on: string | null;
          rate_bps: number | null;
          space_id: string | null;
          term_months: number | null;
          updated_at: string;
        };
        Insert: {
          bank_name?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          fx_amount_minor?: number | null;
          fx_currency?: string | null;
          gold_type?: string | null;
          grams?: number | null;
          id?: string;
          kind: string;
          manual_value?: number | null;
          matures_on?: string | null;
          name: string;
          opened_on?: string | null;
          origin?: string | null;
          origin_note?: string | null;
          principal?: number | null;
          purchase_price?: number | null;
          purchased_on?: string | null;
          rate_bps?: number | null;
          space_id?: string | null;
          term_months?: number | null;
          updated_at?: string;
        };
        Update: {
          bank_name?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          fx_amount_minor?: number | null;
          fx_currency?: string | null;
          gold_type?: string | null;
          grams?: number | null;
          id?: string;
          kind?: string;
          manual_value?: number | null;
          matures_on?: string | null;
          name?: string;
          opened_on?: string | null;
          origin?: string | null;
          origin_note?: string | null;
          principal?: number | null;
          purchase_price?: number | null;
          purchased_on?: string | null;
          rate_bps?: number | null;
          space_id?: string | null;
          term_months?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          amount: number;
          category_id: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          month: string;
          owner_user_id: string | null;
          space_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          month: string;
          owner_user_id?: string | null;
          space_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          month?: string;
          owner_user_id?: string | null;
          space_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          color: string | null;
          created_at: string;
          deleted_at: string | null;
          icon: string | null;
          id: string;
          is_system: boolean;
          kind: string;
          name: string;
          owner_user_id: string | null;
          parent_id: string | null;
          space_id: string | null;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          icon?: string | null;
          id?: string;
          is_system?: boolean;
          kind: string;
          name: string;
          owner_user_id?: string | null;
          parent_id?: string | null;
          space_id?: string | null;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          icon?: string | null;
          id?: string;
          is_system?: boolean;
          kind?: string;
          name?: string;
          owner_user_id?: string | null;
          parent_id?: string | null;
          space_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "categories_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      goal_contributions: {
        Row: {
          amount: number;
          created_at: string;
          deleted_at: string | null;
          goal_id: string;
          id: string;
          occurred_on: string;
          transaction_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          deleted_at?: string | null;
          goal_id: string;
          id?: string;
          occurred_on: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          deleted_at?: string | null;
          goal_id?: string;
          id?: string;
          occurred_on?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_contributions_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_contributions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      goal_links: {
        Row: {
          asset_id: string | null;
          created_at: string;
          deleted_at: string | null;
          goal_id: string;
          id: string;
          updated_at: string;
          wallet_id: string | null;
        };
        Insert: {
          asset_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          goal_id: string;
          id?: string;
          updated_at?: string;
          wallet_id?: string | null;
        };
        Update: {
          asset_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          goal_id?: string;
          id?: string;
          updated_at?: string;
          wallet_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "goal_links_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_links_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_links_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string;
          deadline: string | null;
          deleted_at: string | null;
          id: string;
          name: string;
          space_id: string;
          status: string;
          target_amount: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deadline?: string | null;
          deleted_at?: string | null;
          id?: string;
          name: string;
          space_id: string;
          status?: string;
          target_amount: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deadline?: string | null;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          space_id?: string;
          status?: string;
          target_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      networth_snapshots: {
        Row: {
          assets_share: number;
          fund_share: number;
          net: number;
          on_date: string;
          payable: number;
          receivable: number;
          user_id: string;
          wallets: number;
        };
        Insert: {
          assets_share: number;
          fund_share: number;
          net: number;
          on_date: string;
          payable: number;
          receivable: number;
          user_id: string;
          wallets: number;
        };
        Update: {
          assets_share?: number;
          fund_share?: number;
          net?: number;
          on_date?: string;
          payable?: number;
          receivable?: number;
          user_id?: string;
          wallets?: number;
        };
        Relationships: [
          {
            foreignKeyName: "networth_snapshots_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      price_quotes: {
        Row: {
          buy_price: number;
          created_at: string;
          deleted_at: string | null;
          id: string;
          instrument: string;
          quoted_at: string;
          sell_price: number;
          source: string;
          unit: string;
          updated_at: string;
        };
        Insert: {
          buy_price: number;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          instrument: string;
          quoted_at: string;
          sell_price: number;
          source: string;
          unit: string;
          updated_at?: string;
        };
        Update: {
          buy_price?: number;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          instrument?: string;
          quoted_at?: string;
          sell_price?: number;
          source?: string;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_color: string | null;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_color?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          display_name: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_color?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      settlement_periods: {
        Row: {
          balance_bps_json: Json;
          created_at: string;
          id: string;
          period_end: string;
          space_id: string;
        };
        Insert: {
          balance_bps_json: Json;
          created_at?: string;
          id?: string;
          period_end: string;
          space_id: string;
        };
        Update: {
          balance_bps_json?: Json;
          created_at?: string;
          id?: string;
          period_end?: string;
          space_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "settlement_periods_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
      space_invites: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          expires_at: string;
          id: string;
          space_id: string;
          updated_at: string;
          used_at: string | null;
          used_by: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          expires_at: string;
          id?: string;
          space_id: string;
          updated_at?: string;
          used_at?: string | null;
          used_by?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          expires_at?: string;
          id?: string;
          space_id?: string;
          updated_at?: string;
          used_at?: string | null;
          used_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "space_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_invites_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_invites_used_by_fkey";
            columns: ["used_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      space_members: {
        Row: {
          asset_share_level: string;
          default_ratio_bps: number;
          joined_at: string;
          left_at: string | null;
          space_id: string;
          user_id: string;
        };
        Insert: {
          asset_share_level?: string;
          default_ratio_bps?: number;
          joined_at?: string;
          left_at?: string | null;
          space_id: string;
          user_id: string;
        };
        Update: {
          asset_share_level?: string;
          default_ratio_bps?: number;
          joined_at?: string;
          left_at?: string | null;
          space_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "space_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      spaces: {
        Row: {
          created_at: string;
          created_by: string;
          default_split_mode: string;
          deleted_at: string | null;
          id: string;
          name: string;
          settle_day: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          default_split_mode?: string;
          deleted_at?: string | null;
          id?: string;
          name: string;
          settle_day?: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          default_split_mode?: string;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          settle_day?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "spaces_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction_allocations: {
        Row: {
          amount: number;
          transaction_id: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          transaction_id: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          transaction_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_allocations_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_allocations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          category_id: string | null;
          created_at: string;
          created_by: string;
          currency: string;
          deleted_at: string | null;
          id: string;
          note: string | null;
          occurred_on: string;
          paid_by: string | null;
          paid_to: string | null;
          space_id: string | null;
          split_mode: string | null;
          to_wallet_id: string | null;
          type: string;
          updated_at: string;
          wallet_id: string | null;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          created_at?: string;
          created_by: string;
          currency?: string;
          deleted_at?: string | null;
          id?: string;
          note?: string | null;
          occurred_on: string;
          paid_by?: string | null;
          paid_to?: string | null;
          space_id?: string | null;
          split_mode?: string | null;
          to_wallet_id?: string | null;
          type: string;
          updated_at?: string;
          wallet_id?: string | null;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency?: string;
          deleted_at?: string | null;
          id?: string;
          note?: string | null;
          occurred_on?: string;
          paid_by?: string | null;
          paid_to?: string | null;
          space_id?: string | null;
          split_mode?: string | null;
          to_wallet_id?: string | null;
          type?: string;
          updated_at?: string;
          wallet_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_paid_by_fkey";
            columns: ["paid_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_paid_to_fkey";
            columns: ["paid_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_to_wallet_id_fkey";
            columns: ["to_wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          archived: boolean;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          id: string;
          kind: string;
          name: string;
          opening_balance: number;
          owner_user_id: string | null;
          space_id: string | null;
          updated_at: string;
        };
        Insert: {
          archived?: boolean;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          id?: string;
          kind: string;
          name: string;
          opening_balance?: number;
          owner_user_id?: string | null;
          space_id?: string | null;
          updated_at?: string;
        };
        Update: {
          archived?: boolean;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          id?: string;
          kind?: string;
          name?: string;
          opening_balance?: number;
          owner_user_id?: string | null;
          space_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallets_space_id_fkey";
            columns: ["space_id"];
            isOneToOne: false;
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_asset: {
        Args: { asset_data: Json; owners: Json };
        Returns: {
          bank_name: string | null;
          created_at: string;
          deleted_at: string | null;
          fx_amount_minor: number | null;
          fx_currency: string | null;
          gold_type: string | null;
          grams: number | null;
          id: string;
          kind: string;
          manual_value: number | null;
          matures_on: string | null;
          name: string;
          opened_on: string | null;
          origin: string | null;
          origin_note: string | null;
          principal: number | null;
          purchase_price: number | null;
          purchased_on: string | null;
          rate_bps: number | null;
          space_id: string | null;
          term_months: number | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "assets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_space: {
        Args: { space_name: string };
        Returns: {
          created_at: string;
          created_by: string;
          default_split_mode: string;
          deleted_at: string | null;
          id: string;
          name: string;
          settle_day: number;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "spaces";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_partner_asset_summary: {
        Args: { target_space_id: string };
        Returns: {
          assets: Json;
          share_level: string;
          total_value: number;
        }[];
      };
      get_wallet_display_name: {
        Args: { target_wallet_id: string };
        Returns: string;
      };
      is_asset_owner: { Args: { target_asset_id: string }; Returns: boolean };
      is_space_member: { Args: { target_space_id: string }; Returns: boolean };
      redeem_space_invite: {
        Args: { invite_code: string };
        Returns: {
          created_at: string;
          created_by: string;
          default_split_mode: string;
          deleted_at: string | null;
          id: string;
          name: string;
          settle_day: number;
          status: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "spaces";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      shares_active_space_with: {
        Args: { other_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
