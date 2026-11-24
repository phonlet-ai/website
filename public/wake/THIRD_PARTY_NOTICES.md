# Third-party notices

Phonlet Wake (the engine, the `en-1` model, the English phrases and the SDKs) is Copyright 2026
Phonlet AI and licensed under the PolyForm Noncommercial License 1.0.0, in the file `LICENSE`.
Commercial licences: `COMMERCIAL.md`, or contact@phonletai.com. This file names the work of others
that is built into what this repository ships, or that the `en-1` model and the English phrases
were made from, with the terms and the credit each one asks for.

## Code

The engine (`engine/`, `include/`), the ESP32-S3 acoustic engine and every SDK are Phonlet AI's own
code. No third-party source is copied into them; the JSON reader, the FFT and the WAV reader are
written for this product. Third-party code enters only as the runtime libraries of the compilers
that build them.

### WebAssembly engine (`sdk/web/dist/`)

The `.wasm` files and their `.mjs` loaders are built with Emscripten and contain parts of its
runtime:

| Component | Licence | Copyright |
| --- | --- | --- |
| Emscripten runtime and the generated loader | MIT (also offered under the University of Illinois/NCSA Open Source License) | Copyright (c) 2010-2014 Emscripten authors |
| Path helpers in the loader, taken by Emscripten from Node.js | MIT | Copyright Joyent, Inc. and other Node contributors |
| musl C library, as bundled with Emscripten | MIT | Copyright © 2005-2020 Rich Felker, et al.; full statement below |
| dlmalloc memory allocator | CC0 1.0 (public domain) | Written by Doug Lea |
| LLVM libc++, libc++abi, libunwind and compiler-rt | Apache-2.0 WITH LLVM-exception | The LLVM Project; the exception lifts the notice conditions for compiled code, <https://llvm.org/LICENSE.txt> |

### Native libraries

Native builds link the C and C++ runtime of the toolchain that builds them: GCC's libstdc++ and
libgcc (GPL-3.0 with the GCC Runtime Library Exception), LLVM libc++ in the Android NDK
(Apache-2.0 WITH LLVM-exception), the platform runtimes on Apple systems, and the ESP-IDF
runtime inside an ESP32 application's own build. None of them is part of this repository, and
their exceptions let compiled programs ship without their notices.

The prebuilt Windows x64 library (`kws_engine.dll`) is built with Microsoft Visual C++ and links
its C and C++ runtime statically (`/MT`), as the Visual Studio license terms allow for
redistributable code; it needs no separate runtime installation.

Dependencies that an SDK declares (NumPy for Python; React, React Native and Flutter as peers) are
installed by their package managers under their own licences and are not part of these packages.

## The `en-1` model

`resources/models/en-1/model.pwake` holds weights that Phonlet AI trained from random
initialisation, with no pretrained or teacher model, and input normalisation statistics computed
from the training audio. It contains no audio, transcripts or features from the material below.
Changes made to that material: audio resampled to 16 kHz, mixed with noise and simulated rooms, and
used to train the model; transcripts converted to phone sequences.

### Speech, 4,851 indexed hours

| Corpus | Part | Hours | Terms | Credit |
| --- | --- | ---: | --- | --- |
| Mozilla Common Voice 22.0, English | train | 1,521.2 | CC0 1.0 | The Common Voice contributors, <https://commonvoice.mozilla.org> |
| LibriSpeech ASR corpus | train-clean-100, train-clean-360, train-other-500 | 961.1 | CC BY 4.0 | Vassil Panayotov, Guoguo Chen, Daniel Povey and Sanjeev Khudanpur, "LibriSpeech: an ASR corpus based on public domain audio books", ICASSP 2015, <https://www.openslr.org/12/>; read by LibriVox volunteers |
| GigaSpeech | L subset, train | 2,368.8 | SpeechColab terms of access: use only for non-commercial research and educational purposes; SpeechColab does not own the copyright of the audio (audiobooks, podcasts and online video) | Guoguo Chen et al., "GigaSpeech: An Evolving, Multi-domain ASR Corpus with 10,000 Hours of Transcribed Audio", Interspeech 2021, <https://github.com/SpeechColab/GigaSpeech> |

### Noise and rooms

| Material | Terms | Credit |
| --- | --- | --- |
| MUSAN music, speech and noise (1,999 recordings, 109.3 hours) | CC BY 4.0; every recording is under a Creative Commons licence or in the US public domain, all allowing commercial use; per-recording licences and credits are in the corpus's `LICENSE` files | David Snyder, Guoguo Chen and Daniel Povey, "MUSAN: A Music, Speech, and Noise Corpus", arXiv:1510.08484, 2015, <https://www.openslr.org/17/> |
| Room impulse responses (100,000 rooms) | Simulated by Phonlet AI; no recorded responses | None |

### Pronunciations

Training transcripts were mapped to phones with a 394,409-word dictionary:

| Source | Words | Terms | Credit |
| --- | ---: | --- | --- |
| LibriSpeech lexicon (`librispeech-lexicon.txt`) | 199,534 | Public domain (OpenSLR SLR11) | Vassil Panayotov, Daniel Povey and Sanjeev Khudanpur, <https://www.openslr.org/11/> |
| CMU Pronouncing Dictionary | 58,060 | Carnegie Mellon University's BSD-style licence, text below | Carnegie Mellon University, <https://github.com/cmusphinx/cmudict> |
| g2p_en 2.1.0, for words neither source has | 136,815 | The tool is Apache-2.0; the entries are its generated output | Kyubyong Park and Jongseok Kim, <https://github.com/Kyubyong/g2p> |

## The English phrases

`resources/keywords/en.json` takes its pronunciations from the same dictionary. Its thresholds come
from Phonlet AI's enrollment tool, which measured the `en-1` detector on the material below; none
of it is included.

| Corpus | Part | Terms | Credit |
| --- | --- | --- | --- |
| AMI Meeting Corpus | single distant microphone | CC BY 4.0 | The AMI project; Jean Carletta et al., "The AMI Meeting Corpus: A Pre-Announcement", MLMI 2005, <https://groups.inf.ed.ac.uk/ami/corpus/> |
| Mozilla Common Voice 22.0, English | dev, and train for phone coverage | CC0 1.0 | As above |
| LibriSpeech ASR corpus | dev-clean, dev-other, test-clean, test-other, and train for phone coverage | CC BY 4.0 | As above |
| GigaSpeech | L subset, train, for phone coverage | SpeechColab terms of access, as above | As above |
| MUSAN | music and noise | CC BY 4.0 | As above |

Licence texts: CC BY 4.0 <https://creativecommons.org/licenses/by/4.0/legalcode>, CC0 1.0
<https://creativecommons.org/publicdomain/zero/1.0/legalcode>.

## Notices

### Emscripten

The AUTHORS file: <https://github.com/emscripten-core/emscripten/blob/main/AUTHORS>.

```text
Copyright (c) 2010-2014 Emscripten authors, see AUTHORS file.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### Node.js (path helpers in the Emscripten loader)

```text
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
```

### musl

```text
musl as a whole is licensed under the following standard MIT license:

----------------------------------------------------------------------
Copyright © 2005-2020 Rich Felker, et al.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
----------------------------------------------------------------------

Authors/contributors include:

A. Wilcox
Ada Worcester
Alex Dowad
Alex Suykov
Alexander Monakov
Andre McCurdy
Andrew Kelley
Anthony G. Basile
Aric Belsito
Arvid Picciani
Bartosz Brachaczek
Benjamin Peterson
Bobby Bingham
Boris Brezillon
Brent Cook
Chris Spiegel
Clément Vasseur
Daniel Micay
Daniel Sabogal
Daurnimator
David Carlier
David Edelsohn
Denys Vlasenko
Dmitry Ivanov
Dmitry V. Levin
Drew DeVault
Emil Renner Berthing
Fangrui Song
Felix Fietkau
Felix Janda
Gianluca Anzolin
Hauke Mehrtens
He X
Hiltjo Posthuma
Isaac Dunham
Jaydeep Patil
Jens Gustedt
Jeremy Huntwork
Jo-Philipp Wich
Joakim Sindholt
John Spencer
Julien Ramseier
Justin Cormack
Kaarle Ritvanen
Khem Raj
Kylie McClain
Leah Neukirchen
Luca Barbato
Luka Perkov
Lynn Ochs
M Farkas-Dyck (Strake)
Mahesh Bodapati
Markus Wichmann
Masanori Ogino
Michael Clark
Michael Forney
Mikhail Kremnyov
Natanael Copa
Nicholas J. Kain
orc
Pascal Cuoq
Patrick Oppenlander
Petr Hosek
Petr Skocik
Pierre Carrier
Reini Urban
Rich Felker
Richard Pennington
Ryan Fairfax
Samuel Holland
Segev Finer
Shiz
sin
Solar Designer
Stefan Kristiansson
Stefan O'Rear
Szabolcs Nagy
Timo Teräs
Trutz Behn
Will Dietz
William Haddon
William Pitcock

Portions of this software are derived from third-party works licensed
under terms compatible with the above MIT license:

The TRE regular expression implementation (src/regex/reg* and
src/regex/tre*) is Copyright © 2001-2008 Ville Laurikari and licensed
under a 2-clause BSD license (license text in the source files). The
included version has been heavily modified by Rich Felker in 2012, in
the interests of size, simplicity, and namespace cleanliness.

Much of the math library code (src/math/* and src/complex/*) is
Copyright © 1993,2004 Sun Microsystems or
Copyright © 2003-2011 David Schultz or
Copyright © 2003-2009 Steven G. Kargl or
Copyright © 2003-2009 Bruce D. Evans or
Copyright © 2008 Stephen L. Moshier or
Copyright © 2017-2018 Arm Limited
and labelled as such in comments in the individual source files. All
have been licensed under extremely permissive terms.

The ARM memcpy code (src/string/arm/memcpy.S) is Copyright © 2008
The Android Open Source Project and is licensed under a two-clause BSD
license. It was taken from Bionic libc, used on Android.

The AArch64 memcpy and memset code (src/string/aarch64/*) are
Copyright © 1999-2019, Arm Limited.

The implementation of DES for crypt (src/crypt/crypt_des.c) is
Copyright © 1994 David Burren. It is licensed under a BSD license.

The implementation of blowfish crypt (src/crypt/crypt_blowfish.c) was
originally written by Solar Designer and placed into the public
domain. The code also comes with a fallback permissive license for use
in jurisdictions that may not recognize the public domain.

The smoothsort implementation (src/stdlib/qsort.c) is Copyright © 2011
Lynn Ochs and is licensed under an MIT-style license.

The x86_64 port was written by Nicholas J. Kain and is licensed under
the standard MIT terms.

The mips and microblaze ports were originally written by Richard
Pennington for use in the ellcc project. The original code was adapted
by Rich Felker for build system and code conventions during upstream
integration. It is licensed under the standard MIT terms.

The mips64 port was contributed by Imagination Technologies and is
licensed under the standard MIT terms.

The powerpc port was also originally written by Richard Pennington,
and later supplemented and integrated by John Spencer. It is licensed
under the standard MIT terms.

All other files which have no copyright comments are original works
produced specifically for use as part of this library, written either
by Rich Felker, the main author of the library, or by one or more
contibutors listed above. Details on authorship of individual files
can be found in the git version control history of the project. The
omission of copyright and license comments in each file is in the
interest of source tree size.

In addition, permission is hereby granted for all public header files
(include/* and arch/*/bits/*) and crt files intended to be linked into
applications (crt/*, ldso/dlstart.c, and arch/*/crt_arch.h) to omit
the copyright notice and permission notice otherwise required by the
license, and to use these files without any requirement of
attribution. These files include substantial contributions from:

Bobby Bingham
John Spencer
Nicholas J. Kain
Rich Felker
Richard Pennington
Stefan Kristiansson
Szabolcs Nagy

all of whom have explicitly granted such permission.

This file previously contained text expressing a belief that most of
the files covered by the above exception were sufficiently trivial not
to be subject to copyright, resulting in confusion over whether it
negated the permissions granted in the license. In the spirit of
permissive licensing, and of not having licensing issues being an
obstacle to adoption, that text has been removed.
```

Parts of the musl math library carry this notice:

```text
Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.

Developed at SunSoft, a Sun Microsystems, Inc. business.
Permission to use, copy, modify, and distribute this
software is freely granted, provided that this notice
is preserved.
```

### CMU Pronouncing Dictionary

```text
Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
   The contents of this file are deemed to be source code.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in
   the documentation and/or other materials provided with the
   distribution.

This work was supported in part by funding from the Defense Advanced
Research Projects Agency, the Office of Naval Research and the National
Science Foundation of the United States of America, and by member
companies of the Carnegie Mellon Sphinx Speech Consortium. We acknowledge
the contributions of many volunteers to the expansion and improvement of
this dictionary.

THIS SOFTWARE IS PROVIDED BY CARNEGIE MELLON UNIVERSITY ``AS IS'' AND
ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL CARNEGIE MELLON UNIVERSITY
NOR ITS EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
