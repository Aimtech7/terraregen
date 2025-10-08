import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Mail, UserCheck, UserX } from "lucide-react";

const TeamCollaboration = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('land_owner_id', user.id)
      .order('created_at', { ascending: false });

    setTeamMembers(data || []);
  };

  const inviteMember = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('team_members')
      .insert({
        land_owner_id: user.id,
        member_email: email,
        role,
      });

    if (error) {
      toast.error("Failed to invite team member");
    } else {
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      fetchTeamMembers();
    }
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast.error("Failed to remove team member");
    } else {
      toast.success("Team member removed");
      fetchTeamMembers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Team Collaboration</h1>
          <p className="text-muted-foreground">
            Invite team members to collaborate on land monitoring
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>
              Send an invitation to collaborate on your land regeneration project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={inviteMember}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members yet. Invite someone to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {member.accepted_at ? (
                        <UserCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <Mail className="h-5 w-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium">{member.member_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.accepted_at ? 'Active' : 'Invitation pending'} • {member.role}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamCollaboration;