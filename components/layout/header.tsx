import { createClient } from "@/utils/supabase/server";
import { HeaderClient } from "./header-client";

export async function Header() {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let familyName = "My Time";
    let profile = null;

    if (user) {
        const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, role, avatar_color, family_id")
            .eq("id", user.id)
            .single();

        profile = profileData;

        if (profileData?.family_id) {
            const { data: familyData } = await supabase
                .from("families")
                .select("name")
                .eq("id", profileData.family_id)
                .single();

            if (familyData?.name) {
                familyName = familyData.name;
            }
        }
    }

    const isParent = profile?.role === "parent";
    const dashboardHref = isParent ? "/dashboard" : "/child/dashboard";
    const schedulesHref = isParent ? "/schedules" : "/child/schedules";
    const tasksHref = isParent ? "/tasks" : "/child/tasks";

    return (
        <HeaderClient
            familyName={familyName}
            profile={profile}
            dashboardHref={dashboardHref}
            schedulesHref={schedulesHref}
            tasksHref={tasksHref}
        />
    );
}