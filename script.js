// Global variables
const historyFile = "history.json"
let previousPut = null
let previousCall = null
let previousDifference = null
let dataPoints = []
let trendCount = 0
let currentTrend = null

// DOM elements
const putInput = document.getElementById("put-value")
const callInput = document.getElementById("call-value")
const analyzeBtn = document.getElementById("analyze-btn")
const resetBtn = document.getElementById("reset-btn")
const resultsContainer = document.getElementById("results")

// Load previous data if available
function loadHistory() {
  const storedData = localStorage.getItem(historyFile)
  if (storedData) {
    const history = JSON.parse(storedData)
    if (history && history.data) {
      const lastEntryTime = new Date(history.data[0].time)
      const currentTime = new Date()

      if (currentTime - lastEntryTime <= 24 * 60 * 60 * 1000) {
        dataPoints = history.data
        if (dataPoints.length > 0) {
          previousPut = dataPoints[0].put
          previousCall = dataPoints[0].call
          previousDifference = dataPoints[0].difference
        }
      } else {
        localStorage.removeItem(historyFile)
      }
    }
  }
}

// Save history to localStorage
function saveHistory() {
  localStorage.setItem(historyFile, JSON.stringify({ data: dataPoints }))
}

// Analyze data
function analyzeData() {
  const putValue = Number.parseInt(putInput.value)
  const callValue = Number.parseInt(callInput.value)

  if (isNaN(putValue) || isNaN(callValue)) {
    alert("Please enter valid numeric values!")
    return
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const putChange = previousPut !== null ? putValue - previousPut : 0
  const callChange = previousCall !== null ? callValue - previousCall : 0

  const difference = putValue - callValue
  const differenceChange = previousDifference !== null ? difference - previousDifference : 0

  let signal = ""
  let weakness = ""
  if (callChange > putChange) {
    signal = "Bearish"
    weakness = putChange < 0 ? `Put is weaker by ${Math.abs(putChange)}` : `Call increased by ${callChange}`
  } else if (putChange > callChange) {
    signal = "Bullish"
    weakness = callChange < 0 ? `Call is weaker by ${Math.abs(callChange)}` : `Put increased by ${putChange}`
  }

  if (dataPoints.length >= 2) {
    const lastTwoSignals = dataPoints.slice(0, 2).map((d) => d.signal)
    if (lastTwoSignals.every((s) => s === signal)) {
      trendCount = 3
    } else {
      trendCount = 0
    }
  }

  const tradeSignal =
    trendCount < 3
      ? "No Trade (Waiting for trend confirmation)"
      : signal === "Bullish"
        ? "Call Buy / Put Sell"
        : "Put Buy / Call Sell"

  const newDataPoint = {
    time: currentTime,
    put: putValue,
    call: callValue,
    difference: difference,
    differenceChange: differenceChange,
    putChange: putChange,
    callChange: callChange,
    signal: signal,
    weakness: weakness,
    tradeSignal: tradeSignal,
  }

  dataPoints.unshift(newDataPoint)
  saveHistory()

  previousPut = putValue
  previousCall = callValue
  previousDifference = difference

  refreshResults()
}

// Refresh results display
function refreshResults() {
  resultsContainer.innerHTML = ""
  dataPoints.forEach((data, index) => {
    const diffChangeText =
      data.differenceChange !== 0 ? ` (${data.differenceChange > 0 ? "+" : ""}${data.differenceChange})` : ""

    const resultHTML = `
            <div class="result-item">
                <p><strong>${index + 1}. Time:</strong> ${data.time}</p>
                <p><strong>Put:</strong> ${data.put}, <strong>Call:</strong> ${data.call} (Difference: ${data.difference}${diffChangeText})</p>
                <p><strong>Put Change:</strong> ${data.putChange > 0 ? "+" : ""}${data.putChange}</p>
                <p><strong>Call Change:</strong> ${data.callChange > 0 ? "+" : ""}${data.callChange}</p>
                <p><strong>Signal:</strong> ${data.signal}</p>
                <p><strong>Weakness:</strong> ${data.weakness}</p>
                <p><strong>Trading Signal:</strong> ${data.tradeSignal}</p>
            </div>
        `
    resultsContainer.innerHTML += resultHTML
  })
}

// Reset data
function resetData() {
  previousPut = null
  previousCall = null
  previousDifference = null
  dataPoints = []
  trendCount = 0
  currentTrend = null

  putInput.value = ""
  callInput.value = ""

  localStorage.removeItem(historyFile)
  refreshResults()
}

// Add this function for button click animation
function addClickEffect(button) {
  button.addEventListener("click", function (e) {
    const x = e.clientX - e.target.offsetLeft
    const y = e.clientY - e.target.offsetTop

    const ripples = document.createElement("span")
    ripples.style.left = x + "px"
    ripples.style.top = y + "px"
    this.appendChild(ripples)

    setTimeout(() => {
      ripples.remove()
    }, 1000)
  })
}

// Add click effect to buttons
addClickEffect(analyzeBtn)
addClickEffect(resetBtn)

// Event listeners
analyzeBtn.addEventListener("click", analyzeData)
resetBtn.addEventListener("click", resetData)

// Initial load
loadHistory()
refreshResults()

