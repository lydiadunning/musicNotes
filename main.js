const CMAJOR_SCALE = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] 
// drawNote asks for a number, from 1-7, to represent a note's place on the scale.
// These numbers each correlate to an index on a scale ranging from the bottom
// line on the scale (E4 in this C major scale) to the top line on the scale (F5).
// drawNote limits the available notes to those which fall within this range.
// this limitation simplifies the process of drawing and scaling svg images

const noteSpot = document.getElementById('notes-here')
const button = document.getElementById('input')


const randomNote = () => {
  const note = {}

  const rollDuration = Math.random()

  const rollPitch = () => Math.floor(Math.random() * 7) + 1

  if (rollDuration < 0.25) {
    note.duration = '8n'
    note.pitch = rollPitch()
    const note2 = {
      duration: '8n',
      pitch: rollPitch()
    }
    return [note, note2]
  } else if (rollDuration > 0.75) {
    note.duration = '2n'
  } else {
    note.duration = '4n'
  }
  note.pitch = rollPitch()
  // console.log('note to return', note)
  return note
}

button.addEventListener('click', (e) => {
  const newNote = randomNote()
  // console.log(newNote)
  if (Array.isArray(newNote)) {
    // eighth note pairs must be destructured so each note is an argument
    noteSpot.append(drawNote(...newNote))
  } else {
    noteSpot.append(drawNote(newNote))
  }
})