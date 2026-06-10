'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  full_name: string | null
  created_at: string
  role: string
  essay_count: number
  quiz_total_attempts: number
}

interface EnhancedUsersTableProps {
  users: User[]
  onUserClick: (user: User) => void
}

type SortField = 'email' | 'created_at' | 'essay_count' | 'quiz_total_attempts'
type SortOrder = 'asc' | 'desc'

export function EnhancedUsersTable({ users, onUserClick }: EnhancedUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const itemsPerPage = 15

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return users.filter(user =>
      user.email.toLowerCase().includes(term) ||
      (user.full_name ?? '').toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  // Sort users
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    return sorted
  }, [filteredUsers, sortField, sortOrder])

  // Paginate
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <Card className="card-premium shadow-colored hover-glow transition-all">
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-base md:text-lg bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent">
              All Users
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {sortedUsers.length} total users
              {searchTerm && ` (filtered from ${users.length})`}
            </CardDescription>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
              className="pl-10 border-ocean-300 focus:ring-ocean-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {paginatedUsers.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onUserClick(user)}
                  className="border border-ocean-200 rounded-lg p-3 bg-white hover:bg-ocean-50 hover:border-ocean-400 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col mb-2 gap-0.5">
                    {user.full_name && (
                      <p className="text-sm text-ocean-900 font-semibold">{user.full_name}</p>
                    )}
                    <p className="text-xs text-ocean-600 break-all">{user.email}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ocean-600">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cyan-700">
                        {user.essay_count} essays
                      </span>
                      <span className="text-ocean-500">·</span>
                      <span className="font-semibold text-violet-600">
                        {user.quiz_total_attempts} quizzes
                      </span>
                      <Eye className="h-3.5 w-3.5 text-ocean-400 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ocean-200">
                    <th className="text-left py-3 px-4 text-ocean-700 font-semibold text-sm">
                      Name
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-2 text-ocean-700 font-semibold text-sm hover:text-ocean-900 transition-colors"
                      >
                        Email
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => handleSort('essay_count')}
                        className="flex items-center gap-2 text-ocean-700 font-semibold text-sm hover:text-ocean-900 transition-colors"
                      >
                        Essays
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => handleSort('quiz_total_attempts')}
                        className="flex items-center gap-2 text-ocean-700 font-semibold text-sm hover:text-ocean-900 transition-colors"
                      >
                        Quizzes
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center gap-2 text-ocean-700 font-semibold text-sm hover:text-ocean-900 transition-colors"
                      >
                        Joined
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 text-ocean-700 font-semibold text-sm text-center">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => onUserClick(user)}
                      className="border-b border-ocean-100 hover:bg-ocean-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-ocean-800 text-sm">
                        {user.full_name ?? <span className="text-ocean-400 italic">—</span>}
                      </td>
                      <td className="py-3 px-4 text-ocean-800 text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
                          {user.essay_count}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600">
                          {user.quiz_total_attempts}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ocean-600 text-sm">
                        {format(new Date(user.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Eye className="h-4 w-4 text-ocean-300 group-hover:text-ocean-600 transition-colors mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-ocean-200">
                <p className="text-sm text-ocean-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of{' '}
                  {sortedUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-ocean-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-ocean-700 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-ocean-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-ocean-600">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
