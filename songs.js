// ChordLab — songs.js
// Defines window.SONGS, an array of song objects per CONTRACT.md section 3.
// Chord symbols use the ChordEngine format (e.g. F, Em7, A7, Dm/C, Bbmaj7, A7sus4).
window.SONGS = [
  {
    id: 'yesterday',
    title: 'Yesterday',
    artist: 'The Beatles',
    year: '1965',
    key: 'F',
    capo: 0,
    tags: ['ballad', '60s', 'beatles', 'acoustic'],
    sections: [
      { name: 'Intro', bars: ['F', 'F'] },
      {
        name: 'Verse',
        bars: ['F', 'Em7 A7', 'Dm', 'Dm/C Bbmaj7 C7', 'F Em', 'Dm7 G7', 'Bb F']
      },
      {
        name: 'Bridge',
        bars: ['Em7 A7', 'Dm C Bb Dm/A', 'Gm7 C7', 'F F7', 'Em7 A7', 'Dm C Bb Dm/A', 'Gm7 C7', 'F']
      },
      {
        name: 'Verse',
        bars: ['F', 'Em7 A7', 'Dm', 'Dm/C Bbmaj7 C7', 'F Em', 'Dm7 G7', 'Bb F']
      },
      {
        name: 'Outro',
        bars: ['F/C G7/B', 'Bb F']
      }
    ]
  },
  {
    id: 'knockin-heavens-door',
    title: "Knockin' on Heaven's Door",
    artist: 'Bob Dylan',
    year: '1973',
    key: 'G',
    capo: 0,
    tags: ['folk', 'rock', '70s', 'classic'],
    sections: [
      {
        name: 'Verse',
        bars: ['G', 'D', 'Am', 'Am', 'G', 'D', 'C', 'C']
      },
      {
        name: 'Chorus',
        bars: ['G', 'D', 'C', 'C', 'G', 'D', 'C', 'C']
      }
    ]
  },
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    year: '1970',
    key: 'C',
    capo: 0,
    tags: ['ballad', 'beatles', 'piano', '70s'],
    sections: [
      {
        name: 'Verse',
        bars: ['C', 'G', 'Am', 'F', 'C', 'G', 'F C', 'C']
      },
      {
        name: 'Chorus',
        bars: ['Am', 'G', 'F', 'C', 'C', 'G', 'F C', 'C']
      },
      {
        name: 'Outro',
        bars: ['C', 'G', 'F C', 'C']
      }
    ]
  },
  {
    id: 'stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    year: '1961',
    key: 'A',
    capo: 0,
    tags: ['soul', 'oldies', '60s', 'classic'],
    sections: [
      {
        name: 'Intro',
        bars: ['A', 'A', 'F#m', 'F#m', 'D', 'E', 'A', 'A']
      },
      {
        name: 'Verse',
        bars: ['A', 'A', 'F#m', 'F#m', 'D', 'E', 'A', 'A']
      },
      {
        name: 'Chorus',
        bars: ['A', 'A', 'F#m', 'F#m', 'D', 'E', 'A', 'A']
      }
    ]
  },
  {
    id: 'wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    year: '1995',
    key: 'F#m',
    capo: 2,
    tags: ['britpop', 'rock', '90s', 'acoustic'],
    sections: [
      {
        name: 'Intro',
        bars: ['Em7', 'G', 'Dsus4', 'A7sus4']
      },
      {
        name: 'Verse',
        bars: ['Em7', 'G', 'Dsus4', 'A7sus4', 'Em7', 'G', 'Dsus4', 'A7sus4']
      },
      {
        name: 'Pre-Chorus',
        bars: ['C', 'D', 'A7sus4', 'A7sus4', 'C', 'D', 'G', 'G']
      },
      {
        name: 'Chorus',
        bars: ['Cadd9', 'Em7', 'G', 'Em7', 'Cadd9', 'Em7', 'G', 'G']
      }
    ]
  },
  {
    id: 'hey-jude',
    title: 'Hey Jude',
    artist: 'The Beatles',
    year: '1968',
    key: 'F',
    capo: 0,
    tags: ['ballad', 'beatles', '60s', 'anthem'],
    sections: [
      {
        name: 'Verse',
        bars: ['F', 'C', 'C7', 'F', 'Bb', 'F', 'C7', 'F']
      },
      {
        name: 'Bridge',
        bars: ['Bb', 'Bb', 'F', 'F', 'C7', 'C7', 'F', 'F']
      },
      {
        name: 'Outro',
        bars: ['F', 'Eb', 'Bb', 'F']
      }
    ]
  },
  {
    id: 'wish-you-were-here',
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    year: '1975',
    key: 'G',
    capo: 0,
    tags: ['rock', 'acoustic', '70s', 'classic'],
    sections: [
      {
        name: 'Intro',
        bars: ['Em7', 'G', 'Em7', 'G', 'Em7', 'A7sus4', 'Em7', 'A7sus4', 'G']
      },
      {
        name: 'Verse',
        bars: ['C', 'D', 'Am', 'Am', 'G', 'D', 'C', 'C', 'Am', 'Am', 'G', 'G']
      }
    ]
  },

  // ── Scaletta importata da lista titoli ───────────────────────────────
  {
    id: 'white-room',
    title: 'White Room', artist: 'Cream', year: '1968', key: 'Dm', capo: 0,
    tags: ['rock', '60s', 'psychedelic', 'classic'],
    sections: [
      { name: 'Intro', bars: ['Dm', 'C', 'G', 'G'] },
      { name: 'Verse', bars: ['D', 'C', 'G', 'D', 'C', 'G'] },
      { name: 'Chorus', bars: ['Bb', 'C', 'D', 'Bb', 'C', 'D'] },
      { name: 'Outro', bars: ['G', 'F', 'C', 'D'] }
    ]
  },
  {
    id: 'heroes',
    title: 'Heroes', artist: 'David Bowie', year: '1977', key: 'D', capo: 0,
    tags: ['rock', '70s', 'art-rock', 'classic'],
    sections: [
      { name: 'Intro', bars: ['D', 'G', 'D', 'G'] },
      { name: 'Verse', bars: ['D', 'G', 'D', 'G'] },
      { name: 'Chorus', bars: ['C', 'D', 'G', 'C', 'D', 'G'] },
      { name: 'Bridge', bars: ['Em', 'D', 'C', 'D'] }
    ]
  },
  {
    id: 'wicked-game',
    title: 'Wicked Game', artist: 'Chris Isaak', year: '1989', key: 'Bm', capo: 0,
    tags: ['rock', '80s', 'ballad', 'moody'],
    sections: [
      { name: 'Intro', bars: ['Bm', 'A', 'E', 'Bm', 'A', 'E'] },
      { name: 'Verse', bars: ['Bm', 'A', 'E', 'Bm', 'A', 'E'] },
      { name: 'Chorus', bars: ['Bm', 'A', 'E', 'Bm', 'A', 'E'] }
    ]
  },
  {
    id: 'cocaine',
    title: 'Cocaine', artist: 'Eric Clapton', year: '1977', key: 'E', capo: 0,
    tags: ['rock', '70s', 'blues', 'riff'],
    sections: [
      { name: 'Intro', bars: ['E', 'D', 'E', 'D'] },
      { name: 'Verse', bars: ['E', 'D', 'E', 'D'] },
      { name: 'Chorus', bars: ['D', 'C', 'G', 'D'] },
      { name: 'Outro', bars: ['E', 'D', 'E', 'D'] }
    ]
  },
  {
    id: 'bohemian-like-you',
    title: 'Bohemian Like You', artist: 'The Dandy Warhols', year: '2000', key: 'E', capo: 0,
    tags: ['rock', '00s', 'indie'],
    sections: [
      { name: 'Verse', bars: ['E', 'G', 'A', 'A'] },
      { name: 'Chorus', bars: ['A', 'B', 'E', 'E'] }
    ]
  },
  {
    id: 'easy',
    title: 'Easy', artist: 'Commodores', year: '1977', key: 'Bb', capo: 0,
    tags: ['soul', '70s', 'ballad'],
    sections: [
      { name: 'Verse', bars: ['Bb', 'Gm', 'Eb', 'F'] },
      { name: 'Chorus', bars: ['Bb', 'F', 'Gm', 'Eb', 'F', 'Bb'] }
    ]
  },
  {
    id: 'while-my-guitar-gently-weeps',
    title: 'While My Guitar Gently Weeps', artist: 'The Beatles', year: '1968', key: 'Am', capo: 0,
    tags: ['rock', '60s', 'beatles', 'classic'],
    sections: [
      { name: 'Intro', bars: ['Am', 'Am/G', 'D/F#', 'F'] },
      { name: 'Verse', bars: ['Am', 'Am/G', 'D/F#', 'F', 'Am', 'G', 'D', 'E'] },
      { name: 'Chorus', bars: ['A', 'C#m', 'F#m', 'C#m', 'Bm', 'E', 'A', 'A'] }
    ]
  },
  {
    id: 'karma-police',
    title: 'Karma Police', artist: 'Radiohead', year: '1997', key: 'Am', capo: 0,
    tags: ['rock', '90s', 'alternative'],
    sections: [
      { name: 'Verse', bars: ['Am', 'E/G#', 'G', 'D/F#', 'F', 'C/E', 'Dm', 'E'] },
      { name: 'Chorus', bars: ['D', 'G', 'C', 'Am'] }
    ]
  },
  {
    id: 'angie',
    title: 'Angie', artist: 'The Rolling Stones', year: '1973', key: 'Am', capo: 0,
    tags: ['rock', '70s', 'ballad', 'stones'],
    sections: [
      { name: 'Verse', bars: ['Am', 'E', 'G', 'F', 'C', 'G'] },
      { name: 'Chorus', bars: ['C', 'F', 'G', 'Dm', 'Am', 'E'] }
    ]
  },
  {
    id: 'the-man-who-sold-the-world',
    title: 'The Man Who Sold the World', artist: 'David Bowie', year: '1970', key: 'F', capo: 0,
    tags: ['rock', '70s', 'art-rock'],
    sections: [
      { name: 'Intro', bars: ['F', 'F'] },
      { name: 'Verse', bars: ['F', 'Bb', 'F', 'Bb'] },
      { name: 'Chorus', bars: ['A', 'D', 'A', 'D', 'A', 'D', 'A', 'D'] },
      { name: 'Bridge', bars: ['Dm', 'C', 'Bb', 'A'] }
    ]
  },
  {
    id: 'born-to-run',
    title: 'Born to Run', artist: 'Bruce Springsteen', year: '1975', key: 'E', capo: 0,
    tags: ['rock', '70s', 'anthem', 'classic'],
    sections: [
      { name: 'Verse', bars: ['E', 'A', 'E', 'A', 'B', 'A', 'E'] },
      { name: 'Chorus', bars: ['E', 'A', 'B', 'E', 'A', 'B', 'E', 'E'] }
    ]
  },
  {
    id: 'streets-of-love',
    title: 'Streets of Love', artist: 'The Rolling Stones', year: '2005', key: 'A', capo: 0,
    tags: ['rock', '00s', 'ballad', 'stones'],
    sections: [
      { name: 'Verse', bars: ['A', 'F#m', 'D', 'E'] },
      { name: 'Chorus', bars: ['D', 'E', 'A', 'F#m', 'D', 'E', 'A', 'A'] }
    ]
  },
  {
    id: 'bad-day',
    title: 'Bad Day', artist: 'Daniel Powter', year: '2005', key: 'D', capo: 0,
    tags: ['pop', '00s', 'piano'],
    sections: [
      { name: 'Verse', bars: ['D', 'F#m', 'G', 'A'] },
      { name: 'Chorus', bars: ['G', 'D', 'A', 'Bm', 'G', 'D', 'A', 'A'] }
    ]
  },
  {
    id: 'comfortably-numb',
    title: 'Comfortably Numb', artist: 'Pink Floyd', year: '1979', key: 'Bm', capo: 0,
    tags: ['rock', '70s', 'prog', 'classic'],
    sections: [
      { name: 'Verse', bars: ['Bm', 'A', 'G', 'Em', 'Bm', 'A', 'G', 'Em', 'Bm'] },
      { name: 'Chorus', bars: ['D', 'A', 'C', 'G', 'D', 'A', 'C', 'G', 'D'] }
    ]
  },
  {
    id: 'time',
    title: 'Time', artist: 'Pink Floyd', year: '1973', key: 'F#m', capo: 0,
    tags: ['rock', '70s', 'prog', 'classic'],
    sections: [
      { name: 'Intro', bars: ['F#m', 'A', 'F#m', 'A'] },
      { name: 'Verse', bars: ['F#m', 'A', 'F#m', 'A'] },
      { name: 'Chorus', bars: ['D', 'A', 'E', 'F#m', 'D', 'A', 'E', 'F#m'] }
    ]
  },
  {
    id: 'whiskey-in-the-jar',
    title: 'Whiskey in the Jar', artist: 'Thin Lizzy', year: '1972', key: 'G', capo: 0,
    tags: ['rock', '70s', 'folk-rock', 'irish'],
    sections: [
      { name: 'Verse', bars: ['G', 'Em', 'C', 'G', 'G', 'Em', 'D', 'D'] },
      { name: 'Chorus', bars: ['C', 'G', 'D', 'G', 'C', 'G', 'D', 'G'] }
    ]
  },
  {
    id: 'purple-rain',
    title: 'Purple Rain', artist: 'Prince', year: '1984', key: 'Bb', capo: 0,
    tags: ['rock', '80s', 'ballad', 'classic'],
    sections: [
      { name: 'Intro', bars: ['Bb', 'Bb', 'Gm', 'Gm', 'F', 'F', 'Eb', 'Eb'] },
      { name: 'Verse', bars: ['Bb', 'Gm', 'F', 'Eb'] },
      { name: 'Chorus', bars: ['Bb', 'Gm', 'F', 'Eb'] }
    ]
  },
  {
    id: 'perfect-day',
    title: 'Perfect Day', artist: 'Lou Reed', year: '1972', key: 'A', capo: 0,
    tags: ['rock', '70s', 'ballad'],
    sections: [
      { name: 'Verse', bars: ['A', 'F#m', 'D', 'E'] },
      { name: 'Chorus', bars: ['Bm', 'E', 'A', 'F#m', 'Bm', 'E', 'A', 'A'] },
      { name: 'Bridge', bars: ['E', 'A', 'E', 'A'] }
    ]
  },
  {
    id: 'californication',
    title: 'Californication', artist: 'Red Hot Chili Peppers', year: '1999', key: 'Am', capo: 0,
    tags: ['rock', '90s', 'alternative'],
    sections: [
      { name: 'Verse', bars: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'] },
      { name: 'Chorus', bars: ['F', 'G', 'Am', 'Am', 'F', 'G', 'C', 'G'] },
      { name: 'Solo', bars: ['Am', 'F', 'C', 'G'] }
    ]
  },
  {
    id: 'tunnel-of-love',
    title: 'Tunnel of Love', artist: 'Bruce Springsteen', year: '1987', key: 'G', capo: 0,
    tags: ['rock', '80s'],
    sections: [
      { name: 'Verse', bars: ['G', 'C', 'G', 'D'] },
      { name: 'Chorus', bars: ['C', 'G', 'D', 'Em', 'C', 'G', 'D', 'D'] }
    ]
  },
  {
    id: 'narcotic',
    title: 'Narcotic', artist: 'Liquido', year: '1998', key: 'Bm', capo: 0,
    tags: ['rock', '90s', 'alternative'],
    sections: [
      { name: 'Verse', bars: ['Bm', 'G', 'D', 'A'] },
      { name: 'Chorus', bars: ['G', 'D', 'A', 'Bm', 'G', 'D', 'A', 'A'] }
    ]
  },
  {
    id: 'dont-you',
    title: "Don't You (Forget About Me)", artist: 'Simple Minds', year: '1985', key: 'D', capo: 0,
    tags: ['rock', '80s', 'new-wave'],
    sections: [
      { name: 'Intro', bars: ['D', 'C', 'G', 'D', 'C', 'G'] },
      { name: 'Verse', bars: ['D', 'C', 'G', 'D', 'C', 'G'] },
      { name: 'Chorus', bars: ['G', 'A', 'Bm', 'G', 'A', 'D'] },
      { name: 'Outro', bars: ['Bm', 'A', 'G', 'Bm', 'A', 'G'] }
    ]
  },
  {
    id: 'mr-crowley',
    title: 'Mr. Crowley', artist: 'Ozzy Osbourne', year: '1980', key: 'Dm', capo: 0,
    tags: ['rock', '80s', 'metal'],
    sections: [
      { name: 'Intro', bars: ['Dm', 'A', 'Bb', 'F', 'Gm', 'A', 'Dm', 'A'] },
      { name: 'Verse', bars: ['Dm', 'A', 'Bb', 'F', 'Gm', 'A', 'Dm', 'Dm'] },
      { name: 'Chorus', bars: ['Bb', 'F', 'C', 'Gm', 'A', 'Dm'] }
    ]
  },
  {
    id: 'leaving-new-york',
    title: 'Leaving New York', artist: 'R.E.M.', year: '2004', key: 'G', capo: 0,
    tags: ['rock', '00s', 'alternative'],
    sections: [
      { name: 'Verse', bars: ['Em', 'C', 'G', 'D'] },
      { name: 'Chorus', bars: ['C', 'G', 'D', 'Em', 'C', 'G', 'D', 'D'] }
    ]
  },
  {
    id: 'now-and-then',
    title: 'Now and Then', artist: 'The Beatles', year: '2023', key: 'A', capo: 0,
    tags: ['rock', 'beatles', 'ballad'],
    sections: [
      { name: 'Verse', bars: ['A', 'C#m', 'D', 'E'] },
      { name: 'Chorus', bars: ['F#m', 'D', 'A', 'E', 'F#m', 'D', 'E', 'E'] }
    ]
  },
  {
    id: 'one-u2',
    title: 'One', artist: 'U2', year: '1991', key: 'Am', capo: 0,
    tags: ['rock', '90s', 'ballad', 'anthem'],
    sections: [
      { name: 'Verse', bars: ['Am', 'D', 'Fmaj7', 'G'] },
      { name: 'Chorus', bars: ['C', 'Am', 'F', 'C', 'G', 'G'] }
    ]
  },
  {
    id: 'like-a-rolling-stone',
    title: 'Like a Rolling Stone', artist: 'Bob Dylan', year: '1965', key: 'C', capo: 0,
    tags: ['rock', '60s', 'classic', 'dylan'],
    sections: [
      { name: 'Verse', bars: ['C', 'Dm', 'Em', 'F', 'G', 'G'] },
      { name: 'Chorus', bars: ['F', 'Em', 'Dm', 'C', 'F', 'Em', 'Dm', 'C', 'F', 'G'] }
    ]
  }
];
