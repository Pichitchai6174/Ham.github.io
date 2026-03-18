import StatsCard from "./components/stats-card"
import { Badge } from "./components/ui/badge"
import { ChartContainer, type ChartConfig, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { useDashboardData } from "./hooks/use-dashboard-data"
import { positionGenderSeries, useDashboardStats } from "./hooks/use-dashboard-stats"
import { cn } from "./lib/utils"
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, XAxis, YAxis } from "recharts"

const complianceChartConfig = {
  compliant: {
    label: "ปฏิบัติครบถ้วน",
    color: "var(--color-accent)",
  },
  incomplete: {
    label: "ไม่ครบถ้วน",
    color: "#272727",
  },
} satisfies ChartConfig

const radarChartConfig = {
  score: {
    label: "คะแนนเฉลี่ย",
    color: "var(--color-accent)",
  },
} satisfies ChartConfig

const positionGenderBarChartConfig = {
  seniorFemale: { label: "ชำนาญการพิเศษ | หญิง", color: "var(--color-red-400)" },
  seniorMale: { label: "ชำนาญการพิเศษ | ชาย", color: "var(--color-orange-400)" },
  professionalFemale: { label: "ชำนาญการ | หญิง", color: "var(--color-amber-400)" },
  professionalMale: { label: "ชำนาญการ | ชาย", color: "var(--color-lime-400)" },
  operationalFemale: { label: "ปฏิบัติการ | หญิง", color: "var(--color-emerald-400)" },
  operationalMale: { label: "ปฏิบัติการ | ชาย", color: "var(--color-cyan-400)" },
  registeredFemale: { label: "พยาบาลวิชาชีพ | หญิง", color: "var(--color-violet-400)" },
  registeredMale: { label: "พยาบาลวิชาชีพ | ชาย", color: "var(--color-rose-400)" },
} satisfies ChartConfig

const domainPercentChartConfig = {
  percent: {
    label: "ร้อยละ",
    color: "var(--color-accent)",
  },
} satisfies ChartConfig

const columnWPercentChartConfig = {
  percent: {
    label: "ร้อยละ",
    color: "var(--color-amber-400)",
  },
} satisfies ChartConfig

const columnXPercentChartConfig = {
  percent: {
    label: "ร้อยละ",
    color: "var(--color-violet-400)",
  },
} satisfies ChartConfig

const questionDisplayLabelMap: Partial<Record<number, string>> = {
  1: "บัญชี HAM",
  2: "แยกเก็บยา",
  3: "จำกัดการเข้าถึง",
  4: "การตรวจสอบซ้ำ",
  5: "ตรวจสต็อกประจำเวร",
  6: "Order set",
  7: "เตรียมยา",
  8: "ตรวจสอบซ้ำ",
  9: "ประเมินก่อนให้ยา",
  10: "ติดตามหลังให้ยา",
  11: "บันทึก AE",
  12: "กำกับหัวหน้า",
  13: "Feedback",
  14: "การประสานงาน",
}

const customDomainLabelMap: Record<string, string> = {
  domain1: "บันทึกมีความครบถ้วนตามเกณฑ์ (1-4)",
  domain2: "บันทึกการจัดการยาถูกต้องต่อเนื่องทุกเวร (5-7)",
  domain3: "บันทึกมีการตรวจสอบซ้ำอย่างอิสระ (8)",
  domain4: " มีการเฝ้าระวังผู้ป่วยและเหตุการณ์ (9-11) ไม่พึงประสงค์",
  domain5: "การกำกับดูแลและการพัฒนา (12-14) คุณภาพโดยหัวหน้าเวร",
}

function App() {

  const sheetId = "1126W-GvIoseqtxx1ycWAb826sxP97nqYFQbcVDJ6z70"

  const { data, isLoading, loadingMessage, error, lastUpdated, initDashboard } = useDashboardData(sheetId)

  const evaluatorDateText = lastUpdated ? `ข้อมูล ณ วันที่: ${lastUpdated}` : undefined

  const {
    averageScore,
    discrepancyCount,
    fullComplianceCount,
    discrepancyPercent,
    fullCompliancePercent,
    averageAge,
    bachelorCount,
    masterCount,
    doctoralCount,
    seniorProfessionalCount,
    professionalCount,
    operationalCount,
    registeredNurseCount,
    questionAverages,
    domainAverages,
    columnWPercentages,
    columnXPercentages,
    medicationErrorPercentages,
    positionGenderQuestionAverages,
  } = useDashboardStats(data)

  const getLevelBadgeClass = (level: unknown) => {
    const normalized = level?.toString().trim().toUpperCase() ?? ""

    const levelColorMap: Record<string, string> = {
      A: "bg-red-500/10 border border-red-500 text-red-500",
      B: "bg-orange-500/10 border border-orange-500 text-orange-500",
      C: "bg-amber-500/10 border border-amber-500 text-amber-500",
      D: "bg-yellow-400/10 border border-yellow-400 text-yellow-400",
      E: "bg-lime-500/10 border border-lime-500 text-lime-500",
      F: "bg-green-400/10 border border-green-400 text-green-400",
      G: "bg-green-500/10 border border-green-500 text-green-500",
      H: "bg-emerald-500/10 border border-emerald-500 text-emerald-500",
      I: "bg-green-600/10 border border-green-600 text-green-500",
    }

    return levelColorMap[normalized] ?? "bg-green-600/10 border border-green-600 text-green-500"
  }

  const compliantPercentValue = Math.min(100, Math.max(0, Number(fullCompliancePercent) || 0))
  const incompletePercentValue = 100 - compliantPercentValue

  const complianceChartData = [
    { status: "compliant", value: compliantPercentValue, fill: "url(#complianceGradient)" },
    { status: "incomplete", value: incompletePercentValue, fill: "var(--color-incomplete)" },
  ]

  const radarChartData = questionAverages.map((item) => ({
    question: questionDisplayLabelMap[item.questionNumber] ?? `ข้อ ${item.questionNumber}`,
    score: item.averageValue,
    fullLabel: item.questionLabel,
  }))

  const sortedQuestionAverages = [...questionAverages]
    .sort((a, b) => a.averageValue - b.averageValue)
    .map((item) => {
      const displayLabel = questionDisplayLabelMap[item.questionNumber] ?? `ข้อ ${item.questionNumber}`
      const percent = Math.min(100, Math.max(0, (item.averageValue / 4) * 100))

      return {
        questionNumber: item.questionNumber,
        displayLabel,
        averageValue: item.averageValue,
        percent,
      }
    })

  const positionGenderBarData = positionGenderQuestionAverages.map((item) => ({
    ...item,
    question: questionDisplayLabelMap[item.questionNumber] ?? `ข้อ ${item.questionNumber}`,
  }))

  const truncateLabel = (label: string, maxLength = 40) =>
    label.length > maxLength ? `${label.slice(0, maxLength)}...` : label

  const domainPercentChartData = domainAverages.map((item) => ({
    label: customDomainLabelMap[item.domainKey] ?? item.label,
    percent: item.percent,
    averageValue: item.averageValue,
  }))

  const columnWPercentChartData = columnWPercentages.map((item) => ({
    label: item.label,
    percent: item.percent,
    count: item.count,
  }))

  const columnXPercentChartData = columnXPercentages.map((item) => ({
    label: truncateLabel(item.label, 44),
    fullLabel: item.label,
    percent: item.percent,
    count: item.count,
  }))

  const medicationErrorStatRows = medicationErrorPercentages.map((item) => ({
    label: item.label,
    count: item.count,
    percent: item.percent,
  }))

  const discrepancyGroupLevelStats = Object.values(
    data
      .filter((row) => {
        const isFound = row["พบความคลาดเคลื่อน"]?.toString().trim() === "พบ"
        const levelRaw = row["ระดับความคลาดเคลื่อน"]?.toString().trim() || ""
        const normalizedLevel = levelRaw.toUpperCase()
        const levelOrder = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
        const isOtherLevel = levelRaw.length > 0 && !levelOrder.includes(normalizedLevel)

        return isFound || isOtherLevel
      })
      .reduce((acc, row) => {
        const hamGroup = row["กลุ่มยาที่ต้องเฝ้าระวังสูง"]?.toString().trim() || "ไม่ระบุ"
        const levelRaw = row["ระดับความคลาดเคลื่อน"]?.toString().trim() || "ไม่ระบุ"
        const normalizedLevel = levelRaw.toUpperCase()
        const levelOrder = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
        const isOtherLevel = !levelOrder.includes(normalizedLevel)
        const level = isOtherLevel ? "อื่นๆ" : normalizedLevel
        const key = `${hamGroup}__${level}__${isOtherLevel ? levelRaw : ""}`

        if (!acc[key]) {
          acc[key] = {
            hamGroup,
            level,
            levelRaw,
            isOtherLevel,
            count: 0,
          }
        }

        acc[key].count += 1
        return acc
      }, {} as Record<string, { hamGroup: string; level: string; levelRaw: string; isOtherLevel: boolean; count: number }>),
  )

  const discrepancyStatsTotal = discrepancyGroupLevelStats.reduce((sum, item) => sum + item.count, 0)

  const discrepancyGroupLevelStatsWithPercent = discrepancyGroupLevelStats
    .map((item) => ({
      ...item,
      percent: discrepancyStatsTotal > 0 ? Number(((item.count / discrepancyStatsTotal) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => {
      const levelOrder = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
      const levelA = a.level.trim().toUpperCase()
      const levelB = b.level.trim().toUpperCase()
      const indexA = levelOrder.indexOf(levelA)
      const indexB = levelOrder.indexOf(levelB)
      const safeIndexA = a.isOtherLevel || indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA
      const safeIndexB = b.isOtherLevel || indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB

      if (safeIndexA !== safeIndexB) {
        return safeIndexA - safeIndexB
      }

      if (b.count !== a.count) {
        return b.count - a.count
      }

      return a.hamGroup.localeCompare(b.hamGroup, "th")
    })

  return (
    <div className="bg-dark-900 text-gray-200 font-sans min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              HAM Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base font-light">
              ระบบติดตามตัวชี้วัดยาความเสี่ยงสูง (High-Alert Medication)
            </p>
          </div>

          <button
            onClick={() => { void initDashboard("manual") }}
            disabled={isLoading}
            className="bg-accent hover:bg-accent-hover text-black font-bold py-2 px-6 rounded-full shadow-lg shadow-cyan-500/20 transition duration-300 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {loadingMessage && (
          <div className="flex flex-col items-center justify-center py-20 min-h-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-xl text-accent animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 min-h-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-red-400 text-sm mb-2">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <div className="space-y-6 animate-fade-in">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <StatsCard title="ผู้ประเมินทั้งหมด" value={data.length} dateText={evaluatorDateText} />

              <StatsCard
                title="ความคลาดเคลื่อน"
                value={discrepancyCount}
                dateText={`คิดเป็น ${discrepancyPercent}% ของผู้รายงาน`}
              />

              <StatsCard
                title="ปฏิบัติครบถ้วนตามแนวทาง"
                value={fullComplianceCount}
                dateText={`คิดเป็น ${fullCompliancePercent}% ของผู้รายงาน`}
              />

              <StatsCard
                title="คะแนนเฉลี่ยรวม 14 ด้าน"
                value={Number(averageScore)}
                dateText="จากคะแนนเต็ม 4.00"
              />

            </div>

            {/* Col 1 รายละเอียดความคลาดเคลื่อนและกลุ่มยา HAM, อัตราการปฏิบัติครบถ้วน / ข้อมูลบุคลากร*/}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* รายละเอียดความคลาดเคลื่อนและกลุ่มยา HAM */}
              <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700 max-h-153.5 lg:col-span-2">

                <div className="flex items-center justify-between mb-6 ">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    รายละเอียดความคลาดเคลื่อนและกลุ่มยา HAM
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-125">
                  <Table className="overflow-hidden">
                    <TableHeader className="[&_tr]:border-b-[#1f2937]">
                      <TableRow className="hover:bg-transparent [&_th]:text-gray-100 ">
                        <TableHead>#</TableHead>
                        <TableHead>กลุ่มยา HAM</TableHead>
                        <TableHead className="text-center">ระดับ</TableHead>
                        <TableHead className="text-center">จำนวนครั้ง</TableHead>
                        <TableHead className="text-center">ร้อยละ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="[&_tr]:border-b-[#1f2937]">
                      {discrepancyGroupLevelStatsWithPercent.map((row, index) => (
                        <TableRow key={index} className="hover:bg-transparent [&_td]:text-gray-100 ">
                          <TableCell>{index + 1}</TableCell>

                          <TableCell className="text-wrap break-word whitespace-normal">{row.hamGroup}</TableCell>

                          <TableCell className="text-center">
                            <Badge className={getLevelBadgeClass(row.level)}>
                              {row.level} {row.isOtherLevel && row.levelRaw && `(${row.levelRaw})`}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center text-accent font-medium">{row.count}</TableCell>
                          <TableCell className="text-center">{row.percent.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}

                      {discrepancyGroupLevelStatsWithPercent.length === 0 && (
                        <TableRow className="hover:bg-transparent [&_td]:text-gray-100 ">
                          <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                            ไม่พบข้อมูลความคลาดเคลื่อน
                          </TableCell>
                        </TableRow>
                      )}

                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* อัตราการปฏิบัติครบถ้วน / ข้อมูลบุคลากร */}
              <div className="flex flex-col bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700 max-h-153.5 overflow-y-auto">

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block size-2 bg-accent rounded-full shadow-[0_0_6px_rgba(34,211,238,1),0_0_16px_rgba(34,211,238,0.9),0_0_32px_rgba(34,211,238,0.7),0_0_64px_rgba(34,211,238,0.5)]" />
                    <h1>อัตราการปฏิบัติครบถ้วน</h1>
                  </div>

                  <ChartContainer
                    config={complianceChartConfig}
                    className="mx-auto h-45 w-full max-w-55"
                  >
                    <PieChart>
                      <defs>
                        <linearGradient id="complianceGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent)" />
                          <stop offset="100%" stopColor="var(--color-green-500)" />
                        </linearGradient>
                      </defs>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel nameKey="status" />}
                      />
                      <Pie
                        data={complianceChartData}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={55}
                        outerRadius={80}
                        strokeWidth={2}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                              return null
                            }

                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-green-400 text-2xl font-semibold"
                                >
                                  {fullCompliancePercent}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 18}
                                  className="fill-gray-400 text-sm"
                                >
                                  ครบถ้วน
                                </tspan>
                              </text>
                            )
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>

                <div className="flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block size-2 bg-yellow-500 rounded-full shadow-[0_0_6px_rgba(253,224,71,1),0_0_16px_rgba(253,224,71,0.9),0_0_32px_rgba(253,224,71,0.7),0_0_64px_rgba(253,224,71,0.5)]" />
                    <h1>ข้อมูลบุคลากร</h1>
                  </div>

                  <div
                    className={cn(
                      "grid grid-cols-2 gap-4 [&_span]:text-sm [&_span]:text-gray-400 [&_p]:text-accent [&_p]:text-xl",
                      "[&_div]:bg-[#272727] [&_div]:p-2 [&_div]:rounded-md [&_div]:inset-shadow-sm [&_div]:inset-shadow-[#535353]"
                    )}
                  >

                    <div className="flex flex-col hover:scale-[1.05] transition duration-300 group">
                      <span>อายุเฉลี่ย</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{averageAge} <span className="text-gray-400">ปี</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span>วุฒิปริญญาเอก</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{doctoralCount} <span className="text-gray-400">คน</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span>วุฒิปริญญาโท</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{masterCount} <span className="text-gray-400">คน</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span>วุฒิปริญญาตรี</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{bachelorCount} <span className="text-gray-400">คน</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span className="">ชำนาญการพิเศษ</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{seniorProfessionalCount} <span className="text-gray-400">คน</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span className="">ชำนาญการ</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{professionalCount} <span className="text-gray-400">คน</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span>ปฏิบัติการ</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{operationalCount} <span className="text-gray-400">คน</span></p>
                    </div>

                    <div className="flex flex-col hover:scale-[1.01] transition duration-300 group">
                      <span>พยาบาลวิชาชีพ</span>
                      <p className="group-hover:scale-110 group-hover:translate-x-2 transition-transform">{registeredNurseCount} <span className="text-gray-400">คน</span></p>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Col 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    คะแนนเฉลี่ยรายด้าน 14 ด้าน
                  </h3>
                </div>

                <ChartContainer config={radarChartConfig} className="h-80 w-full">
                  <RadarChart data={radarChartData} outerRadius="90%">
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent labelKey="fullLabel" nameKey="score" />}
                    />
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="question" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 4]}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      tickCount={5}
                    />
                    <Radar
                      dataKey="score"
                      stroke="var(--color-accent)"
                      fill="var(--color-accent)"
                      fillOpacity={0.25}
                      dot={{
                        r: 4,
                        fillOpacity: 1,
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </div>

              <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    คะแนนเฉลี่ยแต่ละด้าน (เรียงต่ำ → สูง)
                  </h3>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {sortedQuestionAverages.map((item) => (
                    <div key={item.questionNumber} className="space-y-1">

                      <div className="flex items-center justify-between text-md">
                        <span className="text-gray-300">{item.displayLabel}</span>
                        <span className="text-accent font-medium">{item.averageValue.toFixed(2)}</span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-dark-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="grid grid-cols-3 gap-6">

              <div className="col-span-2 bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    การตรวจสอบการบันทึกการจัดการยาที่ต้องเฝ้าระวังสูง
                  </h3>
                </div>

                <ChartContainer config={domainPercentChartConfig} className="h-104 w-full">
                  <BarChart data={domainPercentChartData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                    <CartesianGrid vertical={false} stroke="#374151" />
                    <XAxis
                      dataKey="label"
                      tick={(props) => {
                        const { x, y, payload } = props

                        return (
                          <foreignObject x={x - 40} y={y} width={100} height={80}>
                            <div className="text-xs text-gray-400 text-center text-wrap break-word">
                              {payload.value}
                            </div>
                          </foreignObject>
                        )
                      }}
                      interval={0}
                      textAnchor="middle"
                      height={72}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          nameKey="percent"
                          formatter={(value, _name, item) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground">{item.payload.label}</span>
                              <span className="font-mono font-medium text-foreground">{Number(value).toFixed(2)}%</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="percent" fill="var(--color-percent)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>

              <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    ความผิดพลาดในการจัดการยาที่พบ
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-104">
                  <Table className="overflow-hidden">
                    <TableHeader className="[&_tr]:border-b-[#1f2937]">
                      <TableRow className="hover:bg-transparent [&_th]:text-gray-100">
                        <TableHead>รายการ</TableHead>
                        <TableHead className="text-center">จำนวน</TableHead>
                        <TableHead className="text-center">ร้อยละ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="[&_tr]:border-b-[#1f2937]">
                      {medicationErrorStatRows.map((row, index) => (
                        <TableRow key={index} className="hover:bg-transparent [&_td]:text-gray-100">
                          <TableCell className="whitespace-normal wrap-break-word text-sm">{row.label}</TableCell>
                          <TableCell className="text-center text-accent font-medium">{row.count}</TableCell>
                          <TableCell className="text-center">{row.percent.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}

                      {medicationErrorStatRows.length === 0 && (
                        <TableRow className="hover:bg-transparent [&_td]:text-gray-100">
                          <TableCell colSpan={3} className="text-center text-gray-400 py-6">
                            ไม่พบข้อมูล
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="col-span-3 bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    สาเหตุการปฏิบัติไม่ครบหรือไม่ปฏิบัติตามแนวทางการตรวจสอบบันทึกการจัดการยาที่ต้องเฝ้าระวังสูง
                  </h3>
                </div>

                <ChartContainer config={columnWPercentChartConfig} className="h-104 w-full">
                  <BarChart data={columnWPercentChartData} margin={{ top: 8, right: 12, left: 0, bottom: 56 }}>
                    <CartesianGrid vertical={false} stroke="#374151" />
                    <XAxis
                      dataKey="label"
                      tick={(props) => {
                        const { x, y, payload } = props

                        return (
                          <foreignObject x={x - 75} y={y + 6} width={150} height={80}>
                            <div className="text-xs text-gray-400 text-center text-wrap break-word leading-tight">
                              {payload.value}
                            </div>
                          </foreignObject>
                        )
                      }}
                      interval={0}
                      textAnchor="middle"
                      height={74}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelKey="label"
                          nameKey="percent"
                          formatter={(value, _name, item) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground">{item.payload.label}</span>
                              <span className="font-mono font-medium text-foreground">{Number(value).toFixed(2)}%</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="percent" fill="var(--color-percent)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>

              <div className="col-span-3 bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded"></span>
                    การบริหารจัดการต่อเนื่อง
                  </h3>
                </div>

                <ChartContainer config={columnXPercentChartConfig} className="h-104 w-full">
                  <BarChart data={columnXPercentChartData} margin={{ top: 8, right: 12, left: 0, bottom: 56 }}>
                    <CartesianGrid vertical={false} stroke="#374151" />
                    <XAxis
                      dataKey="fullLabel"
                      tick={(props) => {
                        const { x, y, payload } = props

                        return (
                          <foreignObject x={x - 75} y={y + 6} width={150} height={80}>
                            <div className="text-xs text-gray-400 text-center text-wrap break-word leading-tight">
                              {payload.value}
                            </div>
                          </foreignObject>
                        )
                      }}
                      interval={0}
                      textAnchor="middle"
                      height={74}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelKey="fullLabel"
                          nameKey="percent"
                          formatter={(value, _name, item) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground">{item.payload.fullLabel}</span>
                              <span className="font-mono font-medium text-foreground">{Number(value).toFixed(2)}%</span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="percent" fill="var(--color-percent)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>

            </div>

            {/* Col 3 */}
            <div className="bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-6 bg-accent rounded"></span>
                  คะแนนเฉลี่ยรายตำแหน่ง (เปรียบเทียบ 14 ด้าน)
                </h3>
              </div>

              <ChartContainer config={positionGenderBarChartConfig} className="h-104 w-full">
                <BarChart
                  data={positionGenderBarData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 12 }}
                  barSize={14}
                  barGap={2}
                  barCategoryGap="22%"
                >
                  <CartesianGrid vertical={false} stroke="#374151" />
                  <XAxis
                    dataKey="question"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    domain={[0, 4]}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickCount={5}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent labelKey="questionLabel" indicator="line" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />

                  {positionGenderSeries.map((series) => (
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      name={series.key}
                      fill={`var(--color-${series.key})`}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </div>

          </div>
        )}


        <p className="text-gray-400 text-sm mt-6">
          จำนวนข้อมูล: {data.length} รายการ
          {lastUpdated ? ` | อัปเดตล่าสุด: ${lastUpdated}` : ""}
        </p>

      </div>
    </div>
  )
}

export default App