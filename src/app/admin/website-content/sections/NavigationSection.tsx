'use client';

import type { WebsiteContent } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { LuPlus as Plus, LuTrash2 as Trash, LuGlobe as Globe, LuSettings as Settings } from 'react-icons/lu';
interface NavigationSectionProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
  activeSubTab: 'navigation' | 'buttons' | 'mobile';
  editingNavItem: { section: string; index: number } | null;
  setEditingNavItem: (item: { section: string; index: number } | null) => void;
  addNavItem: (section: string) => void;
  removeNavItem: (section: string, index: number) => void;
  onSubTabChange: (tab: 'navigation' | 'buttons' | 'mobile') => void;
}

export function NavigationSection({ content, updateContent, activeSubTab, onSubTabChange, editingNavItem, setEditingNavItem, addNavItem, removeNavItem }: NavigationSectionProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        {([
          { id: 'navigation' as const, label: 'Navigation' },
          { id: 'buttons' as const, label: 'Buttons' },
          { id: 'mobile' as const, label: 'Mobile Menu' },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubTabChange(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#7B2CBF]/10 text-[#7B2CBF]'
                : 'text-gray-600 hover:text-[#7B2CBF] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeSubTab === 'navigation' ? (
                  <div className="space-y-6">
                    {Object.entries(content.navigation).map(([sectionKey, section]) => {
                      if (sectionKey === 'contact' && 'href' in section) {
                        return (
                          <Card key={sectionKey}>
                            <CardHeader>
                              <CardTitle>{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Link</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-semibold mb-2 block">Label</label>
                                  <Input
                                    value={section.label}
                                    onChange={(e) => updateContent(['navigation', sectionKey, 'label'], e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-semibold mb-2 block">URL</label>
                                  <Input
                                    value={section.href}
                                    onChange={(e) => updateContent(['navigation', sectionKey, 'href'], e.target.value)}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }

                      if ('items' in section && Array.isArray(section.items)) {
                        return (
                          <Card key={sectionKey}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle>{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Menu</CardTitle>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addNavItem(sectionKey)}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Item
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <label className="text-sm font-semibold mb-2 block">Menu Label</label>
                                <Input
                                  value={section.label}
                                  onChange={(e) => updateContent(['navigation', sectionKey, 'label'], e.target.value)}
                                />
                              </div>
                              <Separator />
                              <div className="space-y-3">
                                {section.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <Input
                                      value={item.label}
                                      onChange={(e) => {
                                        const newItems = [...section.items];
                                        newItems[index] = { ...newItems[index], label: e.target.value };
                                        updateContent(['navigation', sectionKey, 'items'], newItems);
                                      }}
                                      placeholder="Label"
                                    />
                                    <Input
                                      value={item.href}
                                      onChange={(e) => {
                                        const newItems = [...section.items];
                                        newItems[index] = { ...newItems[index], href: e.target.value };
                                        updateContent(['navigation', sectionKey, 'items'], newItems);
                                      }}
                                      placeholder="/path"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeNavItem(sectionKey, index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            </CardContent>
                          </Card>
                        );
                      }
                      return null;
                    })}
                  </div>
      ) : activeSubTab === 'buttons' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Button Settings
                      </CardTitle>
                      <CardDescription>Configure header buttons</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-semibold">Enable Live Course Button</label>
                            <p className="text-sm text-gray-500">Show/hide the live course button</p>
                          </div>
                          <button
                            onClick={() => updateContent(['buttons', 'liveCourse', 'enabled'], !content.buttons.liveCourse.enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              content.buttons.liveCourse.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                content.buttons.liveCourse.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-2 block">Live Course Button Text</label>
                          <Input
                            value={content.buttons.liveCourse.text}
                            onChange={(e) => updateContent(['buttons', 'liveCourse', 'text'], e.target.value)}
                            placeholder="লাইভ কোর্স"
                          />
                        </div>
                        {content.buttons.liveCourse.href && (
                          <div>
                            <label className="text-sm font-semibold mb-2 block">Live Course Button URL</label>
                            <Input
                              value={content.buttons.liveCourse.href}
                              onChange={(e) => updateContent(['buttons', 'liveCourse', 'href'], e.target.value)}
                              placeholder="/live-courses"
                            />
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Login Button Text</label>
                        <Input
                          value={content.buttons.login.text}
                          onChange={(e) => updateContent(['buttons', 'login', 'text'], e.target.value)}
                          placeholder="লগ ইন"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Login Button URL</label>
                        <Input
                          value={content.buttons.login.href}
                          onChange={(e) => updateContent(['buttons', 'login', 'href'], e.target.value)}
                          placeholder="/login"
                        />
                      </div>
                    </CardContent>
                  </Card>
      ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Mobile Menu Items
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newItems = [...content.mobileMenu.items, { label: '', href: '' }];
                            updateContent(['mobileMenu', 'items'], newItems);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </Button>
                      </div>
                      <CardDescription>Configure mobile menu navigation items</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {content.mobileMenu.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              value={item.label}
                              onChange={(e) => {
                                const newItems = [...content.mobileMenu.items];
                                newItems[index] = { ...newItems[index], label: e.target.value };
                                updateContent(['mobileMenu', 'items'], newItems);
                              }}
                              placeholder="Label"
                            />
                            <Input
                              value={item.href}
                              onChange={(e) => {
                                const newItems = [...content.mobileMenu.items];
                                newItems[index] = { ...newItems[index], href: e.target.value };
                                updateContent(['mobileMenu', 'items'], newItems);
                              }}
                              placeholder="/path"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newItems = content.mobileMenu.items.filter((_, i) => i !== index);
                              updateContent(['mobileMenu', 'items'], newItems);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
      )}
    </>
  );
}
