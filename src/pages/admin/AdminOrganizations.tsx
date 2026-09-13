import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, Plus, UserPlus, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import api, { Cohort, Organization, OrganizationInvitation, OrganizationMembership } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type OrganizationRole = 'owner' | 'admin' | 'instructor' | 'student';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [lastInvitation, setLastInvitation] = useState<OrganizationInvitation | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [timezone, setTimezone] = useState('Africa/Lagos');

  const [learnerId, setLearnerId] = useState('');
  const [memberRole, setMemberRole] = useState<OrganizationRole>('student');

  const [recipientEmail, setRecipientEmail] = useState('');
  const [invitationRole, setInvitationRole] = useState<OrganizationRole>('student');

  const [cohortName, setCohortName] = useState('');
  const [cohortDescription, setCohortDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [creatingCohort, setCreatingCohort] = useState(false);
  const { toast } = useToast();

  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === selectedOrganizationId),
    [organizations, selectedOrganizationId],
  );

  useEffect(() => {
    api.listOrganizations()
      .then((items) => {
        setOrganizations(items);
        if (items[0]) setSelectedOrganizationId(items[0].id);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to load organizations';
        toast({ title: 'Organizations unavailable', description: message, variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setMemberships([]);
      setCohorts([]);
      return;
    }

    setDetailLoading(true);
    setLastInvitation(null);
    setMemberships([]);
    setCohorts([]);
    Promise.all([
      api.listOrganizationMemberships(selectedOrganizationId),
      api.listCohorts(selectedOrganizationId),
    ])
      .then(([membershipItems, cohortItems]) => {
        setMemberships(membershipItems);
        setCohorts(cohortItems);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to load organization details';
        toast({ title: 'Organization details unavailable', description: message, variant: 'destructive' });
      })
      .finally(() => setDetailLoading(false));
  }, [selectedOrganizationId, toast]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) setSlug(slugify(value));
  };

  const handleCreateOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const organization = await api.createOrganization({ name, slug, timezone });
      setOrganizations((current) => [organization, ...current]);
      setSelectedOrganizationId(organization.id);
      setName('');
      setSlug('');
      toast({ title: 'Organization created', description: organization.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create organization';
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrganizationId) return;

    setAddingMember(true);
    try {
      const membership = await api.addOrganizationMemberByLearnerId({
        organizationId: selectedOrganizationId,
        learnerId: learnerId.toUpperCase(),
        role: memberRole,
      });
      setMemberships((current) => {
        const withoutExisting = current.filter((item) => item.user_id !== membership.user_id);
        return [membership, ...withoutExisting];
      });
      setLearnerId('');
      toast({ title: 'Member added', description: `${membership.role} access is now active.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add organization member';
      toast({ title: 'Add member failed', description: message, variant: 'destructive' });
    } finally {
      setAddingMember(false);
    }
  };

  const handleCreateInvitation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrganizationId) return;

    setCreatingInvitation(true);
    try {
      const invitation = await api.createOrganizationInvitation({
        organizationId: selectedOrganizationId,
        recipientEmail: recipientEmail.trim() || undefined,
        role: invitationRole,
      });
      setLastInvitation(invitation);
      setRecipientEmail('');
      toast({ title: 'Invitation created', description: 'Copy the single-use token before leaving this screen.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create invitation';
      toast({ title: 'Invitation failed', description: message, variant: 'destructive' });
    } finally {
      setCreatingInvitation(false);
    }
  };

  const handleCreateCohort = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrganizationId) return;

    setCreatingCohort(true);
    try {
      const cohort = await api.createCohort({
        organizationId: selectedOrganizationId,
        name: cohortName,
        description: cohortDescription,
      });
      setCohorts((current) => [cohort, ...current]);
      setCohortName('');
      setCohortDescription('');
      toast({ title: 'Cohort created', description: cohort.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create cohort';
      toast({ title: 'Cohort failed', description: message, variant: 'destructive' });
    } finally {
      setCreatingCohort(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">Create tenants, add learners by learner ID, and prepare launch cohorts.</p>
          </div>
        </div>

        <div className="grid xl:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Organization
                </CardTitle>
                <CardDescription>Platform admins create launch organizations here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Name</Label>
                    <Input id="org-name" value={name} onChange={(event) => handleNameChange(event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-slug">Slug</Label>
                    <Input id="org-slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-timezone">Timezone</Label>
                    <Input id="org-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving || !name || !slug}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Organization
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Launch Organizations</CardTitle>
                <CardDescription>Real organizations returned by the backend API.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : organizations.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4" />
                    No organizations have been created yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {organizations.map((organization) => (
                      <button
                        key={organization.id}
                        type="button"
                        onClick={() => setSelectedOrganizationId(organization.id)}
                        className={`w-full text-left border rounded-lg p-4 transition ${
                          selectedOrganizationId === organization.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{organization.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {organization.slug} · {organization.timezone}
                            </p>
                          </div>
                          <Badge variant="outline">{organization.status}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedOrganization ? selectedOrganization.name : 'Select an organization'}
                </CardTitle>
                <CardDescription>
                  {selectedOrganization
                    ? `${selectedOrganization.slug} · created ${formatDate(selectedOrganization.created_at)}`
                    : 'Create or select an organization to manage memberships, invitations, and cohorts.'}
                </CardDescription>
              </CardHeader>
              {detailLoading && (
                <CardContent>
                  <div className="py-8 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
                  </div>
                </CardContent>
              )}
            </Card>

            {selectedOrganization && !detailLoading && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Add Member
                    </CardTitle>
                    <CardDescription>Use the learner ID shown after registration. Contact email is not unique.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="learner-id">Learner ID</Label>
                        <Input
                          id="learner-id"
                          placeholder="KK-1234ABCD"
                          value={learnerId}
                          onChange={(event) => setLearnerId(event.target.value.toUpperCase())}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={memberRole} onValueChange={(value) => setMemberRole(value as OrganizationRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="admin">Organization Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={addingMember || !learnerId}>
                        {addingMember && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Add by Learner ID
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Invitation</CardTitle>
                    <CardDescription>Create a single-use invitation token for onboarding.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateInvitation} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Recipient email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="optional@example.com"
                          value={recipientEmail}
                          onChange={(event) => setRecipientEmail(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={invitationRole} onValueChange={(value) => setInvitationRole(value as OrganizationRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="admin">Organization Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={creatingInvitation}>
                        {creatingInvitation && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Invitation
                      </Button>
                    </form>

                    {lastInvitation?.token && (
                      <div className="mt-4 rounded-md border bg-muted/40 p-3">
                        <p className="text-sm font-medium">Single-use token</p>
                        <p className="font-mono text-xs break-all mt-1">{lastInvitation.token}</p>
                        <p className="text-xs text-muted-foreground mt-2">Expires {formatDate(lastInvitation.expires_at)}.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Members
                    </CardTitle>
                    <CardDescription>{memberships.length} active or provisioned organization records.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {memberships.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No organization members yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {memberships.map((membership) => (
                          <div key={membership.id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-mono text-xs break-all">{membership.user_id}</p>
                              <Badge variant="outline">{membership.role}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {membership.status} · joined {formatDate(membership.joined_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cohorts</CardTitle>
                    <CardDescription>Group learners for assignments and reporting.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCohort} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cohort-name">Cohort name</Label>
                        <Input id="cohort-name" value={cohortName} onChange={(event) => setCohortName(event.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cohort-description">Description</Label>
                        <Textarea
                          id="cohort-description"
                          value={cohortDescription}
                          onChange={(event) => setCohortDescription(event.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={creatingCohort || !cohortName}>
                        {creatingCohort && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Cohort
                      </Button>
                    </form>

                    <div className="mt-5 space-y-3">
                      {cohorts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No cohorts yet.</p>
                      ) : (
                        cohorts.map((cohort) => (
                          <div key={cohort.id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium">{cohort.name}</p>
                              <Badge variant="outline">{cohort.status}</Badge>
                            </div>
                            {cohort.description && <p className="text-sm text-muted-foreground mt-1">{cohort.description}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
