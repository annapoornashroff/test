'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ApiClient } from '@/lib/api-client';
import { Relationship } from '@/lib/api-client';

const RELATIONSHIP_TYPES = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'aunt_uncle', label: 'Aunt/Uncle' },
  { value: 'niece_nephew', label: 'Niece/Nephew' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'in_law', label: 'In-Law' },
];

const PRIVACY_LEVELS = [
  { value: 'public', label: 'Public' },
  { value: 'family', label: 'Family Only' },
  { value: 'private', label: 'Private' },
];

export default function RelationshipsPage() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [pendingRelationships, setPendingRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [formData, setFormData] = useState({
    related_user_id: '',
    relationship_type: '',
    privacy_level: 'family',
  });

  useEffect(() => {
    loadRelationships();
  }, []);

  const loadRelationships = async () => {
    try {
      setLoading(true);
      const api = new ApiClient();
      const [allRelationships, pending] = await Promise.all([
        api.getRelationships(),
        api.getPendingRelationships(),
      ]);
      setRelationships(allRelationships as Relationship[]);
      setPendingRelationships(pending as Relationship[]);
      setError(null);
    } catch (err) {
      setError('Failed to load relationships');
      toast.error('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = async () => {
    try {
      const api = new ApiClient();
      await api.createRelationship({
        related_user_id: parseInt(formData.related_user_id),
        relationship_type: formData.relationship_type,
        relationship_name: RELATIONSHIP_TYPES.find(t => t.value === formData.relationship_type)?.label || '',
        privacy_level: formData.privacy_level,
      });
      setShowAddDialog(false);
      setFormData({
        related_user_id: '',
        relationship_type: '',
        privacy_level: 'family',
      });
      toast.success('Relationship request sent');
      loadRelationships();
    } catch (err) {
      toast.error('Failed to create relationship');
    }
  };

  const handleUpdateRelationship = async () => {
    if (!selectedRelationship) return;
    try {
      const api = new ApiClient();
      await api.updateRelationship(selectedRelationship.id, {
        relationship_type: formData.relationship_type,
        relationship_name: RELATIONSHIP_TYPES.find(t => t.value === formData.relationship_type)?.label || '',
        privacy_level: formData.privacy_level,
      });
      setShowEditDialog(false);
      setSelectedRelationship(null);
      toast.success('Relationship updated');
      loadRelationships();
    } catch (err) {
      toast.error('Failed to update relationship');
    }
  };

  const handleDeleteRelationship = async (id: number) => {
    try {
      const api = new ApiClient();
      await api.deleteRelationship(id);
      toast.success('Relationship deleted');
      loadRelationships();
    } catch (err) {
      toast.error('Failed to delete relationship');
    }
  };

  const handleRespondToRequest = async (id: number, accept: boolean) => {
    try {
      const api = new ApiClient();
      await api.respondToRelationship(id, accept);
      toast.success(`Relationship request ${accept ? 'accepted' : 'rejected'}`);
      loadRelationships();
    } catch (err) {
      toast.error('Failed to process relationship request');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relationships</h1>
        <Button onClick={() => setShowAddDialog(true)}>Add Relationship</Button>
      </div>

      {pendingRelationships.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
          <div className="grid gap-4">
            {pendingRelationships.map((relationship) => (
              <Card key={relationship.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">User ID: {relationship.user_id}</p>
                    <p className="text-sm text-gray-500">
                      Type: {relationship.relationship_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested: {new Date(relationship.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleRespondToRequest(relationship.id, true)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRespondToRequest(relationship.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {relationships.map((relationship) => (
          <Card key={relationship.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">User ID: {relationship.related_user_id}</p>
                <p className="text-sm text-gray-500">
                  Type: {relationship.relationship_type}
                </p>
                <p className="text-sm text-gray-500">
                  Privacy: {relationship.privacy_level}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {relationship.status}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRelationship(relationship);
                    setFormData({
                      related_user_id: relationship.related_user_id.toString(),
                      relationship_type: relationship.relationship_type,
                      privacy_level: relationship.privacy_level,
                    });
                    setShowEditDialog(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRelationship(relationship.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Related User ID
              </label>
              <Input
                type="number"
                value={formData.related_user_id}
                onChange={(e) =>
                  setFormData({ ...formData, related_user_id: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Relationship Type
              </label>
              <Select
                value={formData.relationship_type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, relationship_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Privacy Level
              </label>
              <Select
                value={formData.privacy_level}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, privacy_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy level" />
                </SelectTrigger>
                <SelectContent>
                  {PRIVACY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRelationship}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Relationship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Relationship Type
              </label>
              <Select
                value={formData.relationship_type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, relationship_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Privacy Level
              </label>
              <Select
                value={formData.privacy_level}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, privacy_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy level" />
                </SelectTrigger>
                <SelectContent>
                  {PRIVACY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRelationship}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 