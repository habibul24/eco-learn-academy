export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          answer_text: string
          created_at: string | null
          id: number
          is_correct: boolean
          question_id: number
          updated_at: string | null
        }
        Insert: {
          answer_text: string
          created_at?: string | null
          id?: number
          is_correct: boolean
          question_id: number
          updated_at?: string | null
        }
        Update: {
          answer_text?: string
          created_at?: string | null
          id?: number
          is_correct?: boolean
          question_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: number
          created_at: string | null
          id: number
          issue_date: string | null
          updated_at: string | null
          user_full_name: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: number
          created_at?: string | null
          id?: number
          issue_date?: string | null
          updated_at?: string | null
          user_full_name?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: number
          created_at?: string | null
          id?: number
          issue_date?: string | null
          updated_at?: string | null
          user_full_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          course_id: number
          created_at: string | null
          description: string | null
          id: number
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: number
          created_at?: string | null
          description?: string | null
          id?: number
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string | null
          description?: string | null
          id?: number
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: number
          created_at: string | null
          enrollment_date: string | null
          id: number
          payment_id: string | null
          status: Database["public"]["Enums"]["enrollment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: number
          created_at?: string | null
          enrollment_date?: string | null
          id?: number
          payment_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: number
          created_at?: string | null
          enrollment_date?: string | null
          id?: number
          payment_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_feedback: {
        Row: {
          comment: string | null
          course_id: number
          created_at: string | null
          id: number
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: number
          created_at?: string | null
          id?: number
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: number
          created_at?: string | null
          id?: number
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_feedback_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          instructor_id: string | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          instructor_id?: string | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          instructor_id?: string | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          course_id: number
          created_at: string
          currency: string | null
          id: string
          provider: string
          provider_order_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          course_id: number
          created_at?: string
          currency?: string | null
          id?: string
          provider: string
          provider_order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          course_id?: number
          created_at?: string
          currency?: string | null
          id?: string
          provider?: string
          provider_order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_course_responses: {
        Row: {
          course_id: number
          created_at: string | null
          expectations: string
          id: number
          knowledge_level: Database["public"]["Enums"]["knowledge_level"]
          motivation: Database["public"]["Enums"]["motivation"]
          user_id: string
        }
        Insert: {
          course_id: number
          created_at?: string | null
          expectations: string
          id?: number
          knowledge_level: Database["public"]["Enums"]["knowledge_level"]
          motivation: Database["public"]["Enums"]["motivation"]
          user_id: string
        }
        Update: {
          course_id?: number
          created_at?: string | null
          expectations?: string
          id?: number
          knowledge_level?: Database["public"]["Enums"]["knowledge_level"]
          motivation?: Database["public"]["Enums"]["motivation"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_course_responses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          id: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          created_at: string | null
          id: number
          passed: boolean | null
          quiz_id: number
          score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          passed?: boolean | null
          quiz_id: number
          score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          passed?: boolean | null
          quiz_id?: number
          score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          chapter_id: number
          created_at: string | null
          description: string | null
          id: number
          passing_score: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          chapter_id: number
          created_at?: string | null
          description?: string | null
          id?: number
          passing_score?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          chapter_id?: number
          created_at?: string | null
          description?: string | null
          id?: number
          passing_score?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string | null
          id: number
          last_watched_position: number | null
          progress_percentage: number | null
          updated_at: string | null
          user_id: string
          video_id: number
          watched: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_watched_position?: number | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id: string
          video_id: number
          watched?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: number
          last_watched_position?: number | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: number
          watched?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
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
      videos: {
        Row: {
          chapter_id: number
          created_at: string | null
          description: string | null
          duration: number | null
          id: number
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          chapter_id: number
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: number
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          chapter_id?: number
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: number
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      enrollment_status: "active" | "completed" | "expired"
      knowledge_level:
        | "strongly_agree"
        | "agree"
        | "neutral"
        | "disagree"
        | "strongly_disagree"
      motivation:
        | "basic_understanding"
        | "document_handling"
        | "carbon_calculation"
        | "work_assignment"
      question_type: "multiple_choice" | "true_false"
      role: "student" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      enrollment_status: ["active", "completed", "expired"],
      knowledge_level: [
        "strongly_agree",
        "agree",
        "neutral",
        "disagree",
        "strongly_disagree",
      ],
      motivation: [
        "basic_understanding",
        "document_handling",
        "carbon_calculation",
        "work_assignment",
      ],
      question_type: ["multiple_choice", "true_false"],
      role: ["student", "admin"],
    },
  },
} as const
