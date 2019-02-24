import { ChartOptions } from 'chart.js'
import Color from 'color'
import { capitalize, flatten, isUndefined, uniq } from 'lodash'
import randomColor from 'randomcolor'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'

interface Data {
  [key: string]: number
}

interface DataSet {
  name: string
  data: Data
}

type Display = (value: number | string | undefined, long?: boolean) => string
const defaultDisplay: Display = v => `${v}`

interface Props {
  dataSets: DataSet[]
  displayValue?: Display
}

const createOptions = (displayValue: Display): ChartOptions => ({
  scales: {
    yAxes: [
      {
        ticks: {
          callback: v => `${displayValue(v, false)}`,
          beginAtZero: true,
        },
      },
    ],
  },
  tooltips: {
    mode: 'x',
    callbacks: {
      label: (item, data) => {
        if (!isUndefined(data.datasets) && !isUndefined(item.datasetIndex)) {
          return `${data.datasets[item.datasetIndex].label}: ${displayValue(
            item.yLabel,
          )}`
        }

        return displayValue(item.yLabel)
      },
    },
  },
  layout: {
    padding: {
      top: 16,
      bottom: 16,
    },
  },
  legend: {
    position: 'bottom',
  },
})

export const BarChart = ({
  dataSets,
  displayValue = defaultDisplay,
}: Props) => {
  const data = useMemo(
    () => ({
      labels: uniq(flatten(dataSets.map(set => set.name))),
      datasets: uniq(flatten(dataSets.map(set => Object.keys(set.data)))).map(
        name => ({
          label: capitalize(name),
          data: dataSets.map(set => set.data[name]),
          backgroundColor: Color(randomColor())
            .alpha(0.7)
            .string(),
        }),
      ),
    }),
    [dataSets],
  )

  return <Bar data={data} options={createOptions(displayValue)} />
}