'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Select } from 'antd';
import { Button } from '@/components/ui/button';
import { Search, Check, X } from 'lucide-react';

import type { MangaFilterProps, FilterState } from '../../types/manga';

const STATUS_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MangaFilter({
  open,
  onClose,
  onApplyFilter,
  availableTags,
  currentFilters,
}: MangaFilterProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleTagToggle = (tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleStatusChange = (statusValues: string[]) => {
    setFilters((prev) => ({
      ...prev,
      status: statusValues,
    }));
  };

  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { tags: [], status: [] };
    setFilters(resetFilters);
    setTagSearch('');
  };

  const handleCancel = () => {
    setFilters(currentFilters);
    setTagSearch('');
    onClose();
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <Modal
      title="Filter Manga"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="filter-modal"
    >
      <div className="space-y-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Status ({filters.status.length} selected)
          </label>

          {/* Status Select Dropdown */}
          <Select
            mode="multiple"
            placeholder="Select status"
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full"
            options={STATUS_OPTIONS}
            allowClear
          />
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tags ({filters.tags.length} selected)
          </label>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tags Grid */}
          <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-white">
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const isSelected = filters.tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    className={`
                      inline-flex items-center gap-1.5 px-2 py-1 rounded-2xl text-sm font-medium
                      cursor-pointer transition-all duration-200 border-2 select-none
                      ${
                        isSelected
                          ? 'bg-[#E5E7EB] text-white border-gray-400 shadow-lg transform scale-105 ring-2 ring-gray-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:scale-102'
                      }
                    `}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {isSelected && <Check className="h-3 w-3 flex-shrink-0" />}
                    <span>{tag.name}</span>
                  </button>
                );
              })}
            </div>

            {filteredTags.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No tags found matching "{tagSearch}"</p>
              </div>
            )}
          </div>

          {/* Selected Tags Preview */}
          {filters.tags.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Selected tags ({filters.tags.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tagId) => {
                  const tag = availableTags.find((t) => t.id === tagId);
                  return (
                    <div
                      key={tagId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded-full shadow-sm"
                    >
                      <Check className="h-3 w-3 flex-shrink-0" />
                      <span>{tag?.name || tagId}</span>
                      <button
                        onClick={() => handleTagToggle(tagId)}
                        className="ml-1 text-white hover:text-red-200 transition-colors p-0.5 rounded-full hover:bg-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {filters.tags.length > 0 || filters.status.length > 0 ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                {filters.tags.length + filters.status.length} filter(s) active
              </span>
            ) : (
              'No filters applied'
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset All
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply} className="min-w-[100px] !bg-gray-700">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
