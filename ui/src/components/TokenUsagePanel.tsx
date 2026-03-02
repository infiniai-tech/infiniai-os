export function TokenUsagePanel() {
  return (
    <div
      className="rounded-lg border border-[#DDEC90] bg-white dark:bg-[#1a1c14] p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold tracking-wider uppercase text-[#2a2f1a] dark:text-[#e8eada]">
          Token Usage &amp; Cost · MTD
        </h2>
        <span className="rounded-full bg-[#BBCB64]/15 px-3 py-0.5 text-sm font-semibold text-[#BBCB64]">
          84M TOKENS
        </span>
      </div>

      {/* Content: model usage + cost breakdown */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Left: Model usage (60%) */}
        <div className="flex-[3] space-y-4">
          {/* Sonnet 4.6 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-[#2a2f1a] dark:text-[#e8eada]">Sonnet 4.6</span>
              <span className="text-sm font-semibold text-[#2a2f1a]/60 dark:text-[#e8eada]/60">67%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#BBCB64]/15">
              <div className="h-full w-[67%] rounded-full bg-[#BBCB64] transition-all" />
            </div>
          </div>

          {/* Haiku 4.5 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-[#2a2f1a] dark:text-[#e8eada]">Haiku 4.5</span>
              <span className="text-sm font-semibold text-[#2a2f1a]/60 dark:text-[#e8eada]/60">33%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#FFE52A]/20">
              <div className="h-full w-[33%] rounded-full bg-[#FFE52A] transition-all" />
            </div>
          </div>
        </div>

        {/* Right: Cost breakdown (40%) */}
        <div className="flex-[2]">
          <table className="w-full text-base">
            <tbody>
              <tr>
                <td className="py-1.5 text-[#2a2f1a]/60 dark:text-[#e8eada]/60">Compute Cost</td>
                <td className="py-1.5 text-right font-semibold text-[#2a2f1a] dark:text-[#e8eada]">$3,840</td>
              </tr>
              <tr>
                <td className="py-1.5 text-[#2a2f1a]/60 dark:text-[#e8eada]/60">Infra &amp; Storage</td>
                <td className="py-1.5 text-right font-semibold text-[#2a2f1a] dark:text-[#e8eada]">$360</td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <div className="my-2 h-px bg-[#BBCB64]/20" />
                </td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-[#2a2f1a] dark:text-[#e8eada]">Total MTD</td>
                <td className="py-1 text-right text-lg font-bold text-[#2a2f1a] dark:text-[#e8eada]">$4,200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
