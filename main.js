const noteSpot = document.getElementById('notes-here')
const button = document.getElementById('input')


const randomNote = () => {
  const note = {}

  const rollDuration = Math.random()

  const rollPitch = () => Math.floor(Math.random() * 7) + 1

  if (rollDuration < 0.25) {
    note.duration = 'eighth'
    note.pitch = rollPitch()
    const note2 = {
      duration: 'eighth',
      pitch: rollPitch()
    }
    return [note, note2]
  } else if (rollDuration > 0.75) {
    note.duration = 'half'
  } else {
    note.duration = 'quarter'

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