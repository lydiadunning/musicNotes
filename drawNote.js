  /**
   * drawNote 
   * 
   * @param {Object} note
   * @param {number} note.pitch - an integer, 1-7
   * @param {string} note.duration - '2n', '4n', or '8n'
   * 
   * @param {Object} [note2 = false] - same as note, required for eighth notes
  
   * @return {SVG} an image displaying the note, or notes, on a scale.
   */

// drawNote is an immediately invoked function expression. It contains all
// the information used to draw a note, and returns a function for drawing
// the note. This is called immediately, returning an svg image of a note.
const drawNote = (function () {
  // many constants, to simplify shifts in layout.
  // if reformatting, keep the capitalization, to simplify identifying constants.
  const STAFF_COLOR = 'thistle'
  const NOTE_COLOR = 'black'
  const SVG_HEIGHT = '200'
  const BLACK_NOTE_RADIUS = '9'
  const HALF_NOTE_RADIUS = '7'
  const CIRCLE_STROKE_WIDTH = STEM_STROKE_WIDTH = '4'
  const CENTER_X = 30
  const X_AXIS_E_OFFSET = 15 // distance eighth note pairs shift from center.
  const STEM_LENGTH = 65
  const NOTE_SIDE_DISTANCE = 7
  const ONE_COUNT_STAFF_WIDTH = '60'
  const STAFF_LINES = ['40', '70', '100', '130', '160']
  const STAFF_STROKE_WIDTH = '3'
  // the VISUAL_STAFF represents the y axes of notes.
  const VISUAL_STAFF = [160, 145, 130, 115, 100, 85, 70, 55, 40]

  /**
   * @param {string} type 
   * @param {object} attributes
   * @returns {SVG} - an image which can be added to the document or an svg with type 'svg'
   */
  function makeSvgWithAttributes (type, attributes) {
    newSvgElement = document.createElementNS('http://www.w3.org/2000/svg', type)
    Object.keys(attributes).forEach(key => newSvgElement.setAttribute(key, attributes[key]))
    return newSvgElement
  }

  // debug. places a small red dot in the given location.
  function debugDot (x, y) {
    return makeSvgWithAttributes(
      'circle',
      {
        'cx': x,
        'cy': y,
        'r': '1',
        'fill': 'red',
        'stroke': 'red',
      }
    )
  }

  // returns the y axis for the top of a note's stem.
  function getStemTopY (y, stemUp, change = 0) {
    let y1 = Number(y)
    if (stemUp) {
      y1 -= change
    } else {
      y1 += change
    }
    return y1.toString()
  }

  // returns the x axis on the side of a note
  function getStemX (x, stemUp) {
    if (stemUp) {
      return (parseFloat(x) + NOTE_SIDE_DISTANCE).toString()
    } else {
      return (parseFloat(x) - NOTE_SIDE_DISTANCE).toString()
    }
  }

  function drawStem (x, y, stemUp) {
    const yStemEnd = getStemTopY(y, stemUp, STEM_LENGTH)
    const yStemStart = getStemTopY(y, stemUp)
    return makeSvgWithAttributes(
      'line', 
      {
        'x1': x,
        'x2': x, 
        'y1': yStemStart, 
        'y2': yStemEnd, 
        // 'stroke': NOTE_COLOR,
        'stroke-width': STEM_STROKE_WIDTH,
        'stroke-linecap': 'round'
      }
    )
  }

  function drawNotehead (x, y, type) {
    const coords = {'cx': x, 'cy': y}
    if (type === '2n') {
      return makeSvgWithAttributes(
        'circle',
        {
          'r': HALF_NOTE_RADIUS,
          'fill': 'transparent',
          // 'stroke': NOTE_COLOR,
          'stroke-width': CIRCLE_STROKE_WIDTH,
          ...coords
        }
      )
        
    } else {
      return makeSvgWithAttributes(
        'circle',
        {
          'r': BLACK_NOTE_RADIUS,
          // 'fill': NOTE_COLOR,
          ...coords
        }
      )
    }
  }

  function drawBeam (x1, x2, y1, y2, yStemEnd1, yStemEnd2) {
    return makeSvgWithAttributes(
      'polyline',
      {
        'points': `${x1},${y1} ${x1},${yStemEnd1} ${x2},${yStemEnd2} ${x2},${y2}`,
        'fill': 'none',
        // 'stroke': NOTE_COLOR,
        'stroke-width': STEM_STROKE_WIDTH,
        'stroke-linejoin': 'round',
      }
    )
  }

  function drawEighthNotePair (loc1, loc2, stemUp) {
    const yStemEnd1 = getStemTopY(loc1.y, stemUp, STEM_LENGTH)
    const yStemEnd2 = getStemTopY(loc2.y, stemUp, STEM_LENGTH)
    const head1 = drawNotehead(loc1.x, loc1.y, 'e')
    const head2 = drawNotehead(loc2.x, loc2.y, 'e')
    const beam1 = drawBeam(getStemX(loc1.x, stemUp), getStemX(loc2.x, stemUp), loc1.y, loc2.y, yStemEnd1, yStemEnd2)

    return [head1, head2, beam1]
  }

  function drawHalfOrQuarterNote (loc, type, stemUp) {
    const notehead = drawNotehead(loc.x, loc.y, type)
    // moves stem to the side of the note
    loc.x = getStemX(loc.x, stemUp)
    const stem = drawStem(loc.x, loc.y, stemUp)
    return [notehead, stem]
  }

  function drawStaff (width) {
    const staff = []
    for (let i = 0; i < 5; i++) { // There will always be five lines on a staff.
      const line = makeSvgWithAttributes(
        'line',
        {
          'x1': '0',
          'x2': width,
          'y1': STAFF_LINES[i],
          'y2': STAFF_LINES[i],
          // 'stroke': STAFF_COLOR,
          'stroke-width': STAFF_STROKE_WIDTH,
        }
      )
      staff.push(line)
    }
    return staff
  }

  // this function narrows the range of permissible notes (they actually can run 0-8, but 0 and 8 are untested)
  // it also filters out single eighth notes, double non-eighth notes, and notes that don't fall within a set duration.
  // without this function, drawNote only filters half and eighth notes, all others are treated like 4n notes.
  function noteValidator (note, note2) {
    let goodPitch = ([1, 2, 3, 4, 5, 6, 7].includes(note.pitch)) 
    let goodDuration = (['2n', '4n'].includes(note.duration))
    if (note2) {
      goodPitch = goodPitch && [1, 2, 3, 4, 5, 6, 7].includes(note2.pitch)
      goodDuration = note.duration === '8n' && note2.duration === '8n'

      if (!goodPitch) console.error(`A note's pitch must be an integer from 1 to 7. These notes' pitches: ${note.pitch}, ${note2.pitch}`)
      if (!goodDuration) console.error(`Only eighth notes (8n) can be drawn in pairs. These notes' durations: ${note.duration}, ${note2.duration} `)
    } else {
      if (!goodPitch) console.error(`A note's pitch must be an integer from 1 to 7. This note's pitch: ${note.pitch}`)
      if (!goodDuration) console.error(`A single note's duration must be '2n' or '4n'. This note's duration: ${note.duration}`)
    }

    return goodPitch && goodDuration
  }

  /**
   * @param {Object} note
   * @param {number} note.pitch - an integer, 1-7
   * @param {string} note.duration - '2n', '4n', or '8n'
   * @param {Object} [note2 = false] - same as note, required for eighth notes (8n)
   * @return {SVG} an image displaying the note, or notes, on a scale.
   */
  return (note, note2 = false) => {
    if (!noteValidator(note, note2)) return

    const drawnNotes = []
    const {pitch, duration} = note
    const yAxis = VISUAL_STAFF[pitch]
    let stemUp = pitch < 4 // boolean- false for notes on top of staff

    if (duration === '8n') {
      if (note2 && note2.duration =='8n') {
        const pitch2 = note2.pitch
        const xAxis1 = CENTER_X - X_AXIS_E_OFFSET
        const xAxis2 = CENTER_X + X_AXIS_E_OFFSET
        const yAxis2 = VISUAL_STAFF[pitch2]
        if (Math.abs(4 - pitch2) < Math.abs(4 - pitch2)) { // stem orientation
          stemUp = pitch2 < 4
        }
        drawnNotes.push(drawEighthNotePair({
          x: xAxis1.toString(),
          y: yAxis.toString()
        },
        {
          x: xAxis2.toString(),
          y: yAxis2.toString()
        },
        stemUp))
      }
      // want to draw a single eighth note? do that here.
    } else {
      drawnNotes.push(drawHalfOrQuarterNote({
        x: CENTER_X.toString(),
        y: yAxis.toString()
      }, duration, stemUp))
    }

    let svgWidth = duration == '2n' ? ONE_COUNT_STAFF_WIDTH * 2 : ONE_COUNT_STAFF_WIDTH

    const svg = makeSvgWithAttributes(
      'svg',
      {
        'viewBox': `0 0 ${svgWidth} ${SVG_HEIGHT}`
      }
    )

    const staffGroup = makeSvgWithAttributes('g', { 'class': 'staff' })
    drawStaff(svgWidth).forEach(line => staffGroup.appendChild(line))
    svg.appendChild(staffGroup)
    const noteGroup = makeSvgWithAttributes('g', { 'class': 'note' })
    drawnNotes.flat().forEach(item => noteGroup.appendChild(item))
    svg.appendChild(noteGroup)
    return svg
  }
})()

