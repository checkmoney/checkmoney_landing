import { useMappedState } from 'redux-react-hook'
import { useMemo } from 'react'
import { sortBy, take } from 'lodash'

import { displayMoney } from '@shared/helpers/displayMoney'
import { Currency } from '@shared/enum/Currency'
import { GroupBy } from '@shared/enum/GroupBy'
import { useMemoState } from '@front/domain/store'
import { getStatsSources } from '@front/domain/money/selectors/getStatsSources'
import { wantUTC } from '@front/helpers/wantUTC'
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { fetchStatsSources } from '@front/domain/money/actions/fetchStatsSources'
import { getStatsSourcesFetchingStatus } from '@front/domain/money/selectors/getStatsSourcesFetchingStatus'
import { LoaderTable } from '@front/ui/components/layout/loader-table'

interface Props {
  className?: string
  currency: Currency
  group: GroupBy.Month | GroupBy.Year
  widthPercent: number
  maxLength: number
}

export const Sources = ({
  className,
  currency,
  group,
  widthPercent,
  maxLength,
}: Props) => {
  const columns = useMemo(
    () => ({
      source: {
        title: 'Source',
        widthPercent,
      },
      income: {
        title: 'Amount',
        transform: displayMoney(currency),
      },
    }),
    [currency, widthPercent],
  )

  const fetching = useMappedState(getStatsSourcesFetchingStatus)

  const [from, to] = useMemo(() => {
    const start = group === GroupBy.Month ? startOfMonth : startOfYear
    const end = group === GroupBy.Month ? endOfMonth : endOfYear

    return [wantUTC(start)(new Date()), wantUTC(end)(new Date())]
  }, [group])

  const stats = useMemoState(
    () => getStatsSources(from, to, currency),
    () => fetchStatsSources(from, to, currency),
    [from, to, currency],
  )

  // sort by `income` and take `maxLength` top groups
  const preparedData = useMemo(
    () => stats.map(s => take(sortBy(s, t => -t.income), maxLength)),
    [stats, maxLength],
  )

  return (
    <LoaderTable
      title={`What brought you money this ${group}`}
      columns={columns}
      data={preparedData}
      fetching={fetching}
      expectedRows={maxLength}
      className={className}
      hideHeader
    />
  )
}
