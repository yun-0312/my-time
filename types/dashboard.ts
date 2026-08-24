import { StringToBoolean } from "class-variance-authority/types";

export type Role = 'parent' | 'child';

export interface Profile {
    id: string;
    family_id: string | null;
    full_name: string;
    role: Role;
    avatar_color?: string | null;
    created_at?: string;
}

export interface Task {
    id: string;
    family_id: string;
    schedule_id?: string | null;
    title: string;
    description?: string | null;
    assigned_to?: string | null;
    is_completed: boolean;
    due_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Schedule {
    id: string;
    family_id: string;
    target_user_id?: string | null;
    title: string;
    start_at: string;
    end_at?: string | null;
    source: string;
    external_event_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Request {
    id: bigint | number;
    family_id: string;
    requested_by: string;
    content: string;
    status: boolean;
    created_at?: string;
}


