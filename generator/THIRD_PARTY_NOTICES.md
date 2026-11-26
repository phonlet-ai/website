# Third-party notices

`wake-threshold` (this source, the Linux, Windows and macOS binaries and the WebAssembly module) is
Copyright 2026 Phonlet AI and licensed under the PolyForm Noncommercial License 1.0.0, in the file
`LICENSE`. Commercial licences: `COMMERCIAL.md`, or contact@phonletai.com. The binaries and the
WebAssembly module contain the third-party work below; its terms and the credit each part asks for
follow. Ship this file with every copy of a binary or the module.

## Embedded data and models

| Part | Licence | Credit |
| --- | --- | --- |
| g2p_en 2.1.0: the GRU model weights (`assets/g2p/checkpoint20.npz`) and the homograph list (`assets/g2p/homographs.en`), unchanged, and its prediction procedure, rewritten in Rust by Phonlet AI (`src/g2p.rs`); `assets/g2p/homograph_oov.json` records g2p_en's output for three words | Apache-2.0 (text below) | Kyubyong Park and Jongseok Kim, <https://github.com/Kyubyong/g2p> |
| Pronunciation dictionary (`assets/bundle/lexicon.txt`, 394,409 words), built by Phonlet AI from the LibriSpeech lexicon, the current CMU Pronouncing Dictionary and g2p_en predictions | LibriSpeech lexicon: public domain (OpenSLR SLR11); CMU Pronouncing Dictionary: Carnegie Mellon University's BSD-style licence (text below), Copyright (C) 1993-2015 Carnegie Mellon University | Vassil Panayotov, Daniel Povey and Sanjeev Khudanpur, <https://www.openslr.org/11/>; Carnegie Mellon University, <https://github.com/cmusphinx/cmudict> |
| Calibration data (`assets/bundle/`: `generator.json`, `policy.json`, `evidence/`): statistics of the `en-1` detector's scores, and the phone sequences of 72,656 held-out utterances (62.4 hours) converted from their transcripts; no audio | Derived from the corpora in the next table | As listed there |

The `en-1` model whose scores these statistics describe was trained on Common Voice, LibriSpeech
and GigaSpeech speech with MUSAN noise; its own notices ship with the model.

### Corpora behind the calibration data

| Corpus | Part | Terms | Credit |
| --- | --- | --- | --- |
| AMI Meeting Corpus | single distant microphone (held-out statistics and phone sequences) | CC BY 4.0 | The AMI project; Jean Carletta et al., "The AMI Meeting Corpus: A Pre-Announcement", MLMI 2005, <https://groups.inf.ed.ac.uk/ami/corpus/> |
| Mozilla Common Voice 22.0, English | dev (held-out statistics and phone sequences), train (coverage statistics) | CC0 1.0 | The Common Voice contributors, <https://commonvoice.mozilla.org> |
| LibriSpeech ASR corpus | dev-clean, dev-other, test-clean, test-other (held-out statistics and phone sequences); train-clean-100, train-clean-360, train-other-500 (coverage statistics) | CC BY 4.0 | Vassil Panayotov, Guoguo Chen, Daniel Povey and Sanjeev Khudanpur, "LibriSpeech: an ASR corpus based on public domain audio books", ICASSP 2015, <https://www.openslr.org/12/> |
| GigaSpeech | L subset, train (coverage statistics) | SpeechColab terms of access: use only for non-commercial research and educational purposes; SpeechColab does not own the copyright of the audio | Guoguo Chen et al., "GigaSpeech: An Evolving, Multi-domain ASR Corpus with 10,000 Hours of Transcribed Audio", Interspeech 2021, <https://github.com/SpeechColab/GigaSpeech> |
| MUSAN | noise and music, mixed into the measured audio | CC BY 4.0; every recording is under a Creative Commons licence or in the US public domain, all allowing commercial use | David Snyder, Guoguo Chen and Daniel Povey, "MUSAN: A Music, Speech, and Noise Corpus", arXiv:1510.08484, 2015, <https://www.openslr.org/17/> |

Changes: the audio was resampled to 16 kHz, mixed with noise, scored by the `en-1` detector and
reduced to quantised score statistics; transcripts were converted to phone sequences. Licence
texts: CC BY 4.0 <https://creativecommons.org/licenses/by/4.0/legalcode>, CC0 1.0
<https://creativecommons.org/publicdomain/zero/1.0/legalcode>.

## Algorithms reproduced from NumPy

`src/rng.rs` and `src/numeric.rs` reimplement NumPy's `SeedSequence`, its PCG64 generator
(Melissa O'Neill's PCG XSL-RR 128/64), `Generator.integers`, `random` and `choice`, pairwise
summation and `interp`, so that the output matches the reference bit for bit. NumPy is
Copyright (c) 2005-2026, NumPy Developers, BSD-3-Clause (text below).

## Rust crates

Every crate compiled into the binaries or the WebAssembly module, from `Cargo.lock`
(`cargo tree -e normal`, crate version 0.2.0; the WebAssembly build has the same list without
`cpufeatures`). Where a crate offers a choice of licences, it is used here under the MIT licence;
the licence texts are below.

| Crate | Version | Licence | Copyright |
| --- | --- | --- | --- |
| [adler2](https://github.com/oyvindln/adler2) | 2.0.1 | 0BSD OR MIT OR Apache-2.0; used under MIT | Jonas Schievink, oyvindln (crate authors) |
| [anstream](https://github.com/rust-cli/anstyle) | 1.0.0 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [anstyle](https://github.com/rust-cli/anstyle) | 1.0.14 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [anstyle-parse](https://github.com/rust-cli/anstyle) | 1.0.0 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [anstyle-query](https://github.com/rust-cli/anstyle) | 1.1.5 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [block-buffer](https://github.com/RustCrypto/utils) | 0.10.4 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2018-2019 The RustCrypto Project Developers |
| [cfg-if](https://github.com/rust-lang/cfg-if) | 1.0.5 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2014 Alex Crichton |
| [clap](https://github.com/clap-rs/clap) | 4.6.7 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [clap_builder](https://github.com/clap-rs/clap) | 4.6.7 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [clap_lex](https://github.com/clap-rs/clap) | 1.1.1 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [colorchoice](https://github.com/rust-cli/anstyle) | 1.0.5 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [cpufeatures](https://github.com/RustCrypto/utils) | 0.2.17 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2020-2025 The RustCrypto Project Developers |
| [crypto-common](https://github.com/RustCrypto/traits) | 0.1.7 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2021 RustCrypto Developers |
| [digest](https://github.com/RustCrypto/traits) | 0.10.7 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2017 Artyom Pavlov |
| [equivalent](https://github.com/indexmap-rs/equivalent) | 1.0.3 | Apache-2.0 OR MIT; used under MIT | Copyright (c) 2016--2023, the indexmap-rs contributors |
| [foldhash](https://github.com/orlp/foldhash) | 0.2.0 | Zlib | Copyright (c) 2024 Orson Peters |
| [generic-array](https://github.com/fizyk20/generic-array) | 0.14.7 | MIT | Copyright (c) 2015 Bartłomiej Kamiński |
| [hashbrown](https://github.com/rust-lang/hashbrown) | 0.17.1 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2016 Amanieu d'Antras |
| [indexmap](https://github.com/indexmap-rs/indexmap) | 2.14.2 | Apache-2.0 OR MIT; used under MIT | Copyright (c) 2016--2017, the indexmap-rs contributors |
| [is_terminal_polyfill](https://github.com/polyfill-rs/is_terminal_polyfill) | 1.70.2 | MIT OR Apache-2.0; used under MIT | Copyright (c) Individual contributors |
| [itoa](https://github.com/dtolnay/itoa) | 1.0.18 | MIT OR Apache-2.0; used under MIT | David Tolnay (crate author) |
| [memchr](https://github.com/BurntSushi/memchr) | 2.8.3 | Unlicense OR MIT; used under MIT | Copyright (c) 2015 Andrew Gallant |
| [miniz_oxide](https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide) | 0.8.9 | MIT OR Zlib OR Apache-2.0; used under MIT | Copyright 2013-2014 RAD Game Tools and Valve Software; Copyright 2010-2014 Rich Geldreich and Tenacious Software LLC; Copyright (c) 2017 Frommi; Copyright (c) 2017-2024 oyvindln |
| [serde](https://github.com/serde-rs/serde) | 1.0.229 | MIT OR Apache-2.0; used under MIT | Erick Tryzelaar, David Tolnay (crate authors) |
| [serde_core](https://github.com/serde-rs/serde) | 1.0.229 | MIT OR Apache-2.0; used under MIT | Erick Tryzelaar, David Tolnay (crate authors) |
| [serde_json](https://github.com/serde-rs/json) | 1.0.154 | MIT OR Apache-2.0; used under MIT | The serde-rs/json contributors |
| [sha2](https://github.com/RustCrypto/hashes) | 0.10.9 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2006-2009 Graydon Hoare; Copyright (c) 2009-2013 Mozilla Foundation; Copyright (c) 2016 Artyom Pavlov |
| [strsim](https://github.com/rapidfuzz/strsim-rs) | 0.11.1 | MIT | Copyright (c) 2015 Danny Guo; Copyright (c) 2016 Titus Wormer; Copyright (c) 2018 Akash Kurdekar |
| [tinyvec](https://github.com/Lokathor/tinyvec) | 1.13.3 | Zlib OR Apache-2.0 OR MIT; used under MIT | Copyright (c) 2019 Daniel "Lokathor" Gee. |
| [typenum](https://github.com/paholg/typenum) | 1.20.1 | MIT OR Apache-2.0; used under MIT | Copyright (c) 2014 Paho Lurie-Gregg |
| [unicode-general-category](https://github.com/yeslogic/unicode-general-category) | 1.1.0 | Apache-2.0 | YesLogic Pty. Ltd. (crate author) |
| [unicode-normalization](https://github.com/unicode-rs/unicode-normalization) | 0.1.26 | (MIT OR Apache-2.0) AND Unicode-3.0; used under MIT AND Unicode-3.0 | Copyright (c) 2015 The Rust Project Developers; data tables Copyright © 1991-2023 Unicode, Inc. |
| [utf8parse](https://github.com/alacritty/vte) | 0.2.2 | Apache-2.0 OR MIT; used under MIT | Copyright (c) 2016 Joe Wilm |
| [zmij](https://github.com/dtolnay/zmij) | 1.0.23 | MIT | David Tolnay (crate author) |

Compile-time only, not in the binaries: the procedural-macro crates `clap_derive` 4.6.7, `serde_derive` 1.0.229, with `heck` 0.5.0 (MIT OR Apache-2.0), `proc-macro2` 1.0.107 (MIT OR Apache-2.0), `quote` 1.0.47 (MIT OR Apache-2.0), `syn` 3.0.9 (MIT OR Apache-2.0), `unicode-ident` 1.0.27 ((MIT OR Apache-2.0) AND Unicode-3.0); the macros themselves are MIT OR Apache-2.0. The
build-script dependencies (`miniz_oxide`, `serde_json`, `sha2`, `zip` and theirs) only verify and
pack the assets at build time.

## Rust standard library and C runtime

| Part | Where | Licence | Copyright |
| --- | --- | --- | --- |
| Rust standard library, with the crates it is built from (in the WebAssembly module these include ports of Doug Lea's dlmalloc and of musl's math library) | All builds | MIT OR Apache-2.0, used under MIT | Copyrights retained by the Rust project's contributors, <https://github.com/rust-lang/rust> |
| musl C library, linked statically | Linux binary (`x86_64-unknown-linux-musl`) | MIT | Copyright © 2005-2020 Rich Felker, et al.; full statement below |
| LLVM libunwind, linked statically | Linux binary | Apache-2.0 WITH LLVM-exception | The LLVM Project; the exception lifts the notice conditions for compiled code, <https://llvm.org/LICENSE.txt> |

The Windows and macOS binaries use their platforms' system C runtime libraries.

## Licence texts

### Apache License 2.0

Applies to g2p_en and to `unicode-general-category`; also the alternative licence of most crates
above.

```text
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "{}"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright {yyyy} {name of copyright owner}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

### MIT License

Applies to the crates above with the copyright lines given in their rows, to the Rust standard
library, and to musl.

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### zlib License (`foldhash`)

```text
Copyright (c) 2024 Orson Peters

This software is provided 'as-is', without any express or implied warranty. In
no event will the authors be held liable for any damages arising from the use of
this software.

Permission is granted to anyone to use this software for any purpose, including
commercial applications, and to alter it and redistribute it freely, subject to
the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim
    that you wrote the original software. If you use this software in a product,
    an acknowledgment in the product documentation would be appreciated but is
    not required.

2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

3. This notice may not be removed or altered from any source distribution.
```

### Unicode License v3 (Unicode data tables in `unicode-normalization`)

```text
UNICODE LICENSE V3

COPYRIGHT AND PERMISSION NOTICE

Copyright © 1991-2023 Unicode, Inc.

NOTICE TO USER: Carefully read the following legal agreement. BY
DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.

Permission is hereby granted, free of charge, to any person obtaining a
copy of data files and any associated documentation (the "Data Files") or
software and any associated documentation (the "Software") to deal in the
Data Files or Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Data Files or Software, and to permit persons to whom the
Data Files or Software are furnished to do so, provided that either (a)
this copyright and permission notice appear with all copies of the Data
Files or Software, or (b) this copyright and permission notice appear in
associated Documentation.

THE DATA FILES AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
THIRD PARTY RIGHTS.

IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
FILES OR SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall
not be used in advertising or otherwise to promote the sale, use or other
dealings in these Data Files or Software without prior written
authorization of the copyright holder.
```

### CMU Pronouncing Dictionary

```text
Copyright (C) 1993-2008 Carnegie Mellon University. All rights reserved.

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

### NumPy (BSD-3-Clause)

```text
Copyright (c) 2005-2026, NumPy Developers.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    * Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above
       copyright notice, this list of conditions and the following
       disclaimer in the documentation and/or other materials provided
       with the distribution.

    * Neither the name of the NumPy Developers nor the names of any
       contributors may be used to endorse or promote products derived
       from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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

Parts of the musl math library, and of the Rust standard library's port of it, carry this notice:

```text
Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.

Developed at SunSoft, a Sun Microsystems, Inc. business.
Permission to use, copy, modify, and distribute this
software is freely granted, provided that this notice
is preserved.
```
