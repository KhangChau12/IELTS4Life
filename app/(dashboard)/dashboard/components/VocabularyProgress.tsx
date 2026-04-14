'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Brain, BookOpen, CheckCircle, AlertCircle, ArrowRight, Target } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'

interface VocabularyProgressProps {
  totalWords: number
  essaysWithoutVocab: number
  quizScore: number
  paraphraseScore: number
  topicScore: number
  totalCorrect: number
  totalQuestions: number
}

export function VocabularyProgress({
  totalWords,
  essaysWithoutVocab,
  quizScore,
  paraphraseScore,
  topicScore,
  totalCorrect,
  totalQuestions,
}: VocabularyProgressProps) {
  // Pie chart data for quiz performance
  const quizData = [
    { name: 'Correct', value: totalCorrect, color: '#10b981' }, // emerald-600
    { name: 'Incorrect', value: totalQuestions - totalCorrect, color: '#d1d5db' }, // gray-300
  ]

  // Empty state
  if (totalWords === 0 && totalQuestions === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-ocean-50 via-cyan-50 to-blue-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-100/30 to-ocean-100/30 rounded-full -mr-48 -mt-48 pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-ocean-900 flex items-center gap-3">
            <div className="p-2.5 bg-white/80 backdrop-blur rounded-lg">
              <Brain className="h-5 w-5 text-cyan-600" />
            </div>
            Vocabulary Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="py-16 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-2xl bg-white/60 backdrop-blur mb-6">
              <BookOpen className="h-12 w-12 text-ocean-300" />
            </div>
            <h3 className="text-2xl font-bold text-ocean-900 mb-3">Ready to Build Your Word Bank?</h3>
            <p className="text-ocean-700 text-base mb-8 max-w-md">
              Submit essays to extract vocabulary and practice with engaging quizzes. Track your progress as you master new words.
            </p>
            <Link
              href="/write"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-ocean-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start with an Essay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-100/20 to-ocean-100/20 rounded-full -mr-40 -mt-40 pointer-events-none" />
      
      <CardHeader className="relative z-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-ocean-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-100 to-ocean-100 rounded-lg">
              <Brain className="h-5 w-5 text-cyan-600" />
            </div>
            Vocabulary Progress
          </CardTitle>
          <div className="text-right">
            <p className="text-3xl font-bold text-ocean-900">{totalWords}</p>
            <p className="text-xs text-ocean-600 font-medium">Words Learned</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 relative z-10">
        {/* Alert: Essays without vocabulary */}
        {essaysWithoutVocab > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  {essaysWithoutVocab} essay{essaysWithoutVocab > 1 ? 's' : ''} awaiting vocabulary extraction
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Generate vocabulary to expand your word bank and unlock more learning opportunities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Performance Section */}
        {totalQuestions > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Quiz Breakdown with Progress Bars */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-ocean-900 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-cyan-600" />
                  Quiz Performance by Type
                </h3>
                <div className="space-y-4">
                  {/* Paraphrase Quizzes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-ocean-800">Paraphrase Quizzes</label>
                      <span className="text-lg font-bold text-cyan-600">{paraphraseScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={paraphraseScore} className="h-2.5" />
                    <p className="text-xs text-ocean-600 mt-1">Master synonym recognition</p>
                  </div>

                  {/* Topic Quizzes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-ocean-800">Topic Quizzes</label>
                      <span className="text-lg font-bold text-emerald-600">{topicScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={topicScore} className="h-2.5" />
                    <p className="text-xs text-ocean-600 mt-1">Build thematic vocabulary</p>
                  </div>

                  {/* Overall Accuracy */}
                  <div className="mt-6 pt-4 border-t border-ocean-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-ocean-900">Overall Accuracy</label>
                      <span className="text-2xl font-bold text-ocean-900">{quizScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={quizScore} className="h-3" />
                    <p className="text-xs text-ocean-600 mt-2">
                      {totalCorrect} out of {totalQuestions} questions correct
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pie Chart */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-ocean-50/50 to-cyan-50/50 rounded-lg p-6 border border-ocean-100">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={quizData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {quizData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} questions`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 w-full">
                <div className="flex gap-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-ocean-700">Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span className="text-ocean-700">Incorrect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-ocean-100 mb-4">
              <CheckCircle className="h-8 w-8 text-ocean-600" />
            </div>
            <h4 className="text-sm font-semibold text-ocean-900 mb-1">Ready to Test Your Knowledge?</h4>
            <p className="text-sm text-ocean-600 mb-4">Start practicing quizzes to see your progress tracked here</p>
            <Link
              href="/vocabulary"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              Begin a Quiz
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
