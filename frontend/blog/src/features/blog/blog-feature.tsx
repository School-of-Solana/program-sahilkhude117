'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBlogProgram } from '@/hooks/blog-data-access';
import { AppExplorerLink } from '@/components/app-explorer-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit2, Trash2, Calendar, ExternalLink } from 'lucide-react';

export default function BlogFeature() {
  const wallet = useWallet();
  const { accounts, createEntry, updateEntry, deleteEntry } = useBlogProgram();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async () => {
    if (!title || !content) {
      alert('Please enter both title and content');
      return;
    }
    if (title.length > 50) {
      alert('Title must be 50 characters or less');
      return;
    }
    if (content.length > 1000) {
      alert('Content must be 1000 characters or less');
      return;
    }

    await createEntry.mutateAsync({ title, content });
    setTitle('');
    setContent('');
    setIsCreateOpen(false);
  };

  const handleUpdate = async (originalTitle: string) => {
    if (!editingContent) {
      alert('Please enter content');
      return;
    }
    if (editingContent.length > 1000) {
      alert('Content must be 1000 characters or less');
      return;
    }

    await updateEntry.mutateAsync({ title: originalTitle, content: editingContent });
    setEditingTitle(null);
    setEditingContent('');
  };

  const handleDelete = async (title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteEntry.mutateAsync({ title });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to Solana Blog
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Share your thoughts on the fastest blockchain
          </p>
          
          {wallet.publicKey && (
            <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <PopoverTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/50"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Post
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 bg-gray-900 border-gray-800">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white">Create New Post</h3>
                    <p className="text-sm text-gray-400">Share your thoughts with the community</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter post title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={50}
                        className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 text-right">{title.length}/50</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-white">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Write your post..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={1000}
                        className="min-h-[120px] bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 text-right">{content.length}/1000</p>
                    </div>
                    
                    <Button
                      onClick={handleCreate}
                      disabled={createEntry.isPending || !title || !content}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {createEntry.isPending ? 'Creating...' : 'Publish Post'}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {!wallet.publicKey ? (
          <Card className="bg-gray-900 border-gray-800 text-center py-16">
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Plus className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 text-lg">
                Please connect your Solana wallet to start creating and managing blog posts
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Blog Posts Grid */}
            {accounts.isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400">Loading posts...</p>
              </div>
            ) : accounts.data && accounts.data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {accounts.data.map((entry) => (
                  <Card key={entry.publicKey.toString()} className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    {editingTitle === entry.account.title ? (
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-white">{entry.account.title}</h3>
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            maxLength={1000}
                            className="min-h-[150px] bg-black border-gray-700 text-white"
                          />
                          <p className="text-xs text-gray-500 text-right">{editingContent.length}/1000</p>
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleUpdate(entry.account.title)}
                              disabled={updateEntry.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {updateEntry.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingTitle(null);
                                setEditingContent('');
                              }}
                              className="border-gray-700 text-white hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader>
                          <CardTitle className="text-white text-2xl">{entry.account.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(entry.account.createdAt * 1000).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {entry.account.updatedAt !== entry.account.createdAt && (
                              <span className="text-xs">(Updated: {new Date(entry.account.updatedAt * 1000).toLocaleDateString()})</span>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {entry.account.content}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t border-gray-800 pt-4">
                          <AppExplorerLink
                            address={entry.publicKey.toString()}
                            label={
                              <span className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
                                <ExternalLink className="h-3 w-3" />
                                Explorer
                              </span>
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTitle(entry.account.title);
                                setEditingContent(entry.account.content);
                              }}
                              className="border-gray-700 text-white hover:bg-gray-800"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(entry.account.title)}
                              disabled={deleteEntry.isPending}
                              className="border-red-900 text-red-400 hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deleteEntry.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800 text-center py-16">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                      <Plus className="h-10 w-10 text-purple-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">No Posts Yet</h2>
                  <p className="text-gray-400 text-lg mb-6">
                    Start sharing your thoughts by creating your first post
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
