<template>
  <!--
    GuitarDecoration — GuitarView 的横版装饰组件
    原始 SVG 坐标系（300×760 竖向）包在 rotate(90) translate(0,300) 里
    新 viewBox 0 0 760 300  → 琴头在左，琴体在右
    弦在原坐标 x = 122-169，旋转后显示在 y_display = 300 - x ≈ 131-178
    扫弦方向：上下（垂直）拖动
  -->
  <div class="gd-wrap"
    @mousemove.passive="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @touchstart.passive="initAudio"
    @touchmove.prevent="onTouchMove"
    @touchend="onMouseUp"
  >
    <svg
      class="gd-svg"
      viewBox="0 0 760 300"
      xmlns="http://www.w3.org/2000/svg"
      ref="svg"
    >
      <defs>
        <!-- 与 GuitarView 相同渐变，ID 加 hd 前缀避免冲突 -->
        <linearGradient id="hdBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#bebebe"/>
          <stop offset="12%"  stop-color="#efefef"/>
          <stop offset="45%"  stop-color="#ffffff"/>
          <stop offset="82%"  stop-color="#ebebeb"/>
          <stop offset="100%" stop-color="#b8b8b8"/>
        </linearGradient>
        <linearGradient id="hdNeck" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#9e7438"/>
          <stop offset="36%"  stop-color="#d0985a"/>
          <stop offset="64%"  stop-color="#deb472"/>
          <stop offset="100%" stop-color="#8c6228"/>
        </linearGradient>
        <linearGradient id="hdFb" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#1c0e06"/>
          <stop offset="50%"  stop-color="#2c1a0c"/>
          <stop offset="100%" stop-color="#160c02"/>
        </linearGradient>
        <linearGradient id="hdHs" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#bebebe"/>
          <stop offset="35%"  stop-color="#efefef"/>
          <stop offset="65%"  stop-color="#e6e6e6"/>
          <stop offset="100%" stop-color="#b2b2b2"/>
        </linearGradient>
        <linearGradient id="hdChrome" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="#f0f0f0"/>
          <stop offset="42%"  stop-color="#acacac"/>
          <stop offset="100%" stop-color="#747474"/>
        </linearGradient>
        <radialGradient id="hdKnob" cx="36%" cy="30%" r="64%">
          <stop offset="0%"   stop-color="#8a8a8a"/>
          <stop offset="100%" stop-color="#222222"/>
        </radialGradient>
        <filter id="hdGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="hdShadow" x="-18%" y="-6%" width="140%" height="128%">
          <feDropShadow dx="4" dy="8" stdDeviation="11" flood-color="#000" flood-opacity="0.48"/>
        </filter>
      </defs>

      <!--
        矩阵变换：(x_orig, y_orig) → (y_orig, 300 - x_orig)
        SVG matrix(a,b,c,d,e,f): x'=a·x+c·y+e, y'=b·x+d·y+f
        a=0,b=-1,c=1,d=0,e=0,f=300  →  x'=y, y'=300-x
        琴头（y小）→ 左边；琴体（y大）→ 右边；viewBox 0 0 760 300 恰好覆盖全身
      -->
      <g transform="matrix(0,-1,1,0,0,300)">

        <!-- ============== HEADSTOCK ============== -->
        <path d="M 122,6 C 116,2 106,3 102,11 C 98,19 99,32 101,50 L 103,99 C 103,116 110,131 121,136 L 179,136 C 190,131 197,116 197,99 L 199,50 C 201,32 202,19 198,11 C 194,3 184,2 178,6 Z"
          fill="url(#hdHs)" stroke="#b4b4b4" stroke-width="1.5"/>
        <path d="M 126,8 C 134,5 145,4 155,4 C 166,4 175,6 179,9"
          fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2"/>
        <text x="150" y="52" text-anchor="middle" fill="#808080"
          font-size="13" font-style="italic" font-family="Georgia,serif" letter-spacing="1">Fender</text>
        <text x="150" y="72" text-anchor="middle" fill="#a4a4a4"
          font-size="6.5" font-family="Arial,sans-serif" letter-spacing="2.8">STRATOCASTER</text>
        <rect x="132" y="106" width="36" height="5.5" rx="2.75" fill="#aaaaaa" stroke="#848484" stroke-width="0.5"/>
        <rect x="141" y="103" width="18" height="4" rx="2" fill="#888888"/>
        <g v-for="idx in 6" :key="'hdtp'+idx">
          <rect :x="96" :y="8 + (idx-1)*20" width="16" height="8" rx="4"
            fill="#c0c0c0" stroke="#848484" stroke-width="0.5"/>
          <ellipse :cx="91" :cy="12 + (idx-1)*20" rx="9" ry="5"
            fill="url(#hdChrome)" stroke="#848484" stroke-width="0.5"/>
        </g>
        <rect x="117" y="133" width="66" height="9" rx="2" fill="#efece0" stroke="#c8c8c8" stroke-width="0.5"/>

        <!-- ============== NECK ============== -->
        <path d="M 119,140 L 112,418 L 188,418 L 181,140 Z" fill="url(#hdNeck)"/>
        <path d="M 121,140 L 114,415 L 186,415 L 179,140 Z" fill="url(#hdFb)"/>
        <line x1="121" y1="140" x2="114" y2="415" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <line x1="179" y1="140" x2="186" y2="415" stroke="rgba(0,0,0,0.28)" stroke-width="1"/>
        <g v-for="fr in fretData" :key="'hdfr'+fr.n">
          <line :x1="fr.x1" :y1="fr.y" :x2="fr.x2" :y2="fr.y"
            stroke="#a08868" :stroke-width="fr.n === 12 ? 2.2 : 1.3" opacity="0.88"/>
        </g>
        <circle cx="150" cy="210" r="3.5" fill="#ccc4a0" opacity="0.88"/>
        <circle cx="150" cy="251" r="3.5" fill="#ccc4a0" opacity="0.88"/>
        <circle cx="150" cy="288" r="3.5" fill="#ccc4a0" opacity="0.88"/>
        <circle cx="150" cy="321" r="3.5" fill="#ccc4a0" opacity="0.88"/>
        <circle cx="143" cy="349" r="3"   fill="#ccc4a0" opacity="0.88"/>
        <circle cx="157" cy="349" r="3"   fill="#ccc4a0" opacity="0.88"/>

        <!-- ============== BODY ============== -->
        <path :d="bodyPath" fill="#000" opacity="0.18" transform="translate(5,9)"/>
        <path :d="bodyPath" fill="url(#hdBody)" stroke="#c0c0c0" stroke-width="1.5" filter="url(#hdShadow)"/>
        <path :d="bodyPath" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2.5"/>
        <path d="M 246,436 C 260,450 264,468 260,482 C 256,496 242,502 230,498 C 246,512 272,548 276,582 C 282,624 274,664 256,696 C 237,724 206,737 186,741"
          fill="none" stroke="rgba(130,130,130,0.42)" stroke-width="3.5"/>
        <rect x="120" y="410" width="60" height="18" rx="2" fill="#181818" opacity="0.7"/>
        <circle cx="126" cy="415" r="2" fill="#383838"/>
        <circle cx="174" cy="415" r="2" fill="#383838"/>
        <circle cx="126" cy="424" r="2" fill="#383838"/>
        <circle cx="174" cy="424" r="2" fill="#383838"/>

        <!-- ============== PICKUPS ============== -->
        <rect x="119" y="452" width="62" height="24" rx="4" fill="#222222"/>
        <rect x="121" y="454" width="58" height="20" rx="3" fill="#141414"/>
        <g v-for="pp in 6" :key="'hdnp'+pp">
          <circle :cx="123+(pp-1)*9" cy="464" r="2.5" fill="#747474"/>
        </g>
        <circle cx="121" cy="455" r="1.8" fill="#3a3a3a"/>
        <circle cx="179" cy="455" r="1.8" fill="#3a3a3a"/>
        <circle cx="121" cy="474" r="1.8" fill="#3a3a3a"/>
        <circle cx="179" cy="474" r="1.8" fill="#3a3a3a"/>

        <rect x="119" y="503" width="62" height="24" rx="4" fill="#222222"/>
        <rect x="121" y="505" width="58" height="20" rx="3" fill="#141414"/>
        <g v-for="pp in 6" :key="'hdmp'+pp">
          <circle :cx="123+(pp-1)*9" cy="515" r="2.5" fill="#747474"/>
        </g>
        <circle cx="121" cy="506" r="1.8" fill="#3a3a3a"/>
        <circle cx="179" cy="506" r="1.8" fill="#3a3a3a"/>
        <circle cx="121" cy="525" r="1.8" fill="#3a3a3a"/>
        <circle cx="179" cy="525" r="1.8" fill="#3a3a3a"/>

        <rect x="119" y="551" width="62" height="24" rx="4" fill="#222222"/>
        <rect x="121" y="553" width="58" height="20" rx="3" fill="#141414"/>
        <g v-for="pp in 6" :key="'hdbp'+pp">
          <circle :cx="123+(pp-1)*9" cy="563" r="2.5" fill="#747474"/>
        </g>
        <circle cx="121" cy="554" r="1.8" fill="#3a3a3a"/>
        <circle cx="179" cy="554" r="1.8" fill="#3a3a3a"/>
        <circle cx="121" cy="573" r="1.8" fill="#3a3a3a"/>
        <circle cx="179" cy="573" r="1.8" fill="#3a3a3a"/>

        <!-- ============== BRIDGE ============== -->
        <rect x="113" y="580" width="74" height="16" rx="3" fill="url(#hdChrome)" stroke="#989898" stroke-width="0.8"/>
        <g v-for="(s, si) in stringsData" :key="'hdsd'+si">
          <rect :x="s.x-3.5" y="582" width="7" height="12" rx="1.5" fill="#b2b2b2"/>
        </g>
        <path d="M 189,593 Q 209,607 219,626" fill="none" stroke="#acacac" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="219" cy="626" r="4.5" fill="#acacac"/>

        <!-- ============== CONTROLS ============== -->
        <rect x="221" y="464" width="10" height="42" rx="5" fill="#1e1e1e"/>
        <rect x="223" y="476" width="6"  height="16" rx="3" fill="url(#hdChrome)"/>
        <circle cx="228" cy="542" r="12" fill="url(#hdKnob)" stroke="#4c4c4c" stroke-width="0.8"/>
        <circle cx="228" cy="542" r="3.8" fill="#2c2c2c"/>
        <line x1="228" y1="542" x2="228" y2="531" stroke="#acacac" stroke-width="2" stroke-linecap="round"/>
        <circle cx="221" cy="573" r="10" fill="url(#hdKnob)" stroke="#4c4c4c" stroke-width="0.8"/>
        <circle cx="221" cy="573" r="3"  fill="#2c2c2c"/>
        <line x1="221" y1="573" x2="221" y2="564" stroke="#acacac" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="234" cy="598" r="10" fill="url(#hdKnob)" stroke="#4c4c4c" stroke-width="0.8"/>
        <circle cx="234" cy="598" r="3"  fill="#2c2c2c"/>
        <line x1="234" y1="598" x2="234" y2="589" stroke="#acacac" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="256" cy="621" r="8.5" fill="#161616" stroke="#585858" stroke-width="0.8"/>
        <circle cx="256" cy="621" r="3.8" fill="#808080"/>
        <circle cx="58"  cy="462" r="6"   fill="url(#hdChrome)" stroke="#848484" stroke-width="0.5"/>
        <circle cx="150" cy="742" r="6"   fill="url(#hdChrome)" stroke="#848484" stroke-width="0.5"/>

        <!-- ============== STRINGS (INTERACTIVE) ============== -->
        <!--
          旋转后弦方向变为水平
          原始 x 坐标 → 显示 y：y_display = 300 - s.x
          拖动方向从"横向"改为"纵向"，由外层事件 onMouseMove/onTouchMove 处理
        -->
        <g v-for="(s, i) in stringsData" :key="'hdstr'+i"
          @mousedown.stop="onStringDown(i)"
          @touchstart.prevent.stop="onStringTouchStart(i)"
          style="cursor:crosshair">
          <!-- 宽命中区（旋转后变成横向长条，移动端需要更宽） -->
          <line :x1="s.x" y1="141" :x2="s.x" y2="581" stroke="transparent" stroke-width="32"/>
          <!-- 发光层 -->
          <path v-if="s.vibrating"
            :d="getStringPath(i)"
            :stroke="s.glowColor"
            :stroke-width="s.width * 4"
            fill="none" opacity="0.22" stroke-linecap="round"
            filter="url(#hdGlow)"/>
          <!-- 弦本体 -->
          <path :d="getStringPath(i)"
            :stroke="s.color"
            :stroke-width="s.width"
            fill="none" stroke-linecap="round"/>
        </g>
      </g><!-- end rotate group -->
    </svg>

    <!-- 音名浮标 -->
    <transition name="nd-fade">
      <div v-if="lastNote" class="gd-note">{{ lastNote }}</div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'GuitarDecoration',

  data() {
    return {
      audioCtx: null,
      lastNote: '',
      isDragging: false,
      lastStrumIdx: -1,
      noteTimer: null,
      animFrames: Array(6).fill(null),
      /* 与 GuitarView 完全相同的弦数据 */
      stringsData: [
        { note: 'E2', freq: 82.41,  x: 122, color: '#cec4a4', glowColor: '#ffd060', width: 3.2, vibrating: false, amp: 0, phase: 0 },
        { note: 'A2', freq: 110.00, x: 131, color: '#cec4a4', glowColor: '#ffd060', width: 2.7, vibrating: false, amp: 0, phase: 0 },
        { note: 'D3', freq: 146.83, x: 140, color: '#d2d2d2', glowColor: '#beddff', width: 2.2, vibrating: false, amp: 0, phase: 0 },
        { note: 'G3', freq: 196.00, x: 150, color: '#dadada', glowColor: '#beddff', width: 1.8, vibrating: false, amp: 0, phase: 0 },
        { note: 'B3', freq: 246.94, x: 160, color: '#e9e9e9', glowColor: '#ffffff', width: 1.4, vibrating: false, amp: 0, phase: 0 },
        { note: 'E4', freq: 329.63, x: 169, color: '#f3f3f3', glowColor: '#ffffff', width: 1.1, vibrating: false, amp: 0, phase: 0 },
      ],
    }
  },

  computed: {
    /* 与 GuitarView 完全相同 */
    fretData() {
      const nutY = 140, scalePx = 448, cx = 150
      const wNut = 58, wHeel = 72, neckLen = 275
      const frets = []
      for (let n = 1; n <= 22; n++) {
        const ratio = 1 - 1 / Math.pow(2, n / 12)
        const y = Math.round(nutY + scalePx * ratio)
        if (y > 415) break
        const w = wNut + (wHeel - wNut) * ((y - nutY) / neckLen)
        frets.push({ n, y, x1: Math.round(cx - w / 2 + 1), x2: Math.round(cx + w / 2 - 1) })
      }
      return frets
    },
    bodyPath() {
      return [
        'M 116,421','C 95,421 67,423 53,435','C 39,447 33,463 37,477',
        'C 41,491 55,497 67,495','C 51,509 27,543 21,578','C 15,614 21,656 39,690',
        'C 59,720 93,736 119,742','C 132,744 141,745 150,745','C 159,745 168,744 181,742',
        'C 207,736 241,720 261,690','C 279,656 285,614 279,578','C 273,543 249,509 233,495',
        'C 245,497 259,491 263,477','C 267,463 261,447 247,435','C 233,423 205,421 184,421',
        'C 176,419 166,417 150,417','C 134,417 124,419 116,421 Z',
      ].join(' ')
    },
  },

  beforeUnmount() {
    this.animFrames.forEach(f => f && cancelAnimationFrame(f))
    if (this.noteTimer) clearTimeout(this.noteTimer)
    if (this.audioCtx) this.audioCtx.close()
  },

  methods: {
    /* ─── Audio ─── */
    initAudio() {
      if (!this.audioCtx) {
        try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)() }
        catch (e) { return }
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {})
      }
    },
    getCtx() {
      if (!this.audioCtx) {
        try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)() }
        catch (e) { return null }
      }
      return this.audioCtx
    },
    makeDistortionCurve(k) {
      const n = 512, curve = new Float32Array(n)
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1
        curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x))
      }
      return curve
    },
    async playString(idx) {
      const ctx = this.getCtx(); if (!ctx) return
      if (ctx.state === 'suspended') {
        try { await ctx.resume() } catch (e) { /* audio unlock failed */ }
      }
      if (ctx.state !== 'running') return
      const now = ctx.currentTime, freq = this.stringsData[idx].freq
      const pLen = Math.floor(ctx.sampleRate * 0.02)
      const pBuf = ctx.createBuffer(1, pLen, ctx.sampleRate)
      const pd = pBuf.getChannelData(0)
      for (let i = 0; i < pLen; i++) { const t = i/pLen; pd[i] = (Math.random()*2-1)*(1-t)*(1-t) }
      const pSrc = ctx.createBufferSource(); pSrc.buffer = pBuf
      const pBP = ctx.createBiquadFilter(); pBP.type='bandpass'; pBP.frequency.value=freq*3.5; pBP.Q.value=1
      const pG = ctx.createGain(); pG.gain.setValueAtTime(0.22,now); pG.gain.exponentialRampToValueAtTime(0.001,now+0.024)
      const hDef=[{m:1,a:.50,d:2.9},{m:2,a:.22,d:2.3},{m:3,a:.10,d:1.8},{m:4,a:.055,d:1.3},{m:5,a:.028,d:1.0}]
      const hMix=ctx.createGain(); hMix.gain.value=1
      hDef.forEach(({m,a,d})=>{
        const osc=ctx.createOscillator(); osc.type='triangle'; osc.frequency.value=freq*m; osc.detune.value=(Math.random()-.5)*7
        const g=ctx.createGain(); g.gain.setValueAtTime(a,now); g.gain.exponentialRampToValueAtTime(0.0001,now+d)
        osc.connect(g); g.connect(hMix); osc.start(now); osc.stop(now+d+.06)
      })
      const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=Math.min(freq*10,7000)
      const mid=ctx.createBiquadFilter(); mid.type='peaking'; mid.frequency.value=400; mid.gain.value=2.5; mid.Q.value=1.2
      const ws=ctx.createWaveShaper(); ws.curve=this.makeDistortionCurve(7); ws.oversample='2x'
      const rDel=ctx.createDelay(.5); rDel.delayTime.value=.054
      const rFB=ctx.createGain(); rFB.gain.value=.25
      const rSend=ctx.createGain(); rSend.gain.value=.18
      const rRet=ctx.createGain(); rRet.gain.value=.48
      const master=ctx.createGain(); master.gain.value=0.42
      hMix.connect(ws); ws.connect(lp); lp.connect(mid); mid.connect(master)
      mid.connect(rSend); rSend.connect(rDel); rDel.connect(rFB); rFB.connect(rDel); rFB.connect(rRet); rRet.connect(master)
      pSrc.connect(pBP); pBP.connect(pG); pG.connect(master); master.connect(ctx.destination)
      pSrc.start(now); pSrc.stop(now+.025)
    },

    /* ─── 振弦动画（与 GuitarView 相同） ─── */
    startVibration(idx) {
      const s = this.stringsData[idx]
      s.vibrating = true; s.amp = 8; s.phase = Math.PI/2
      if (this.animFrames[idx]) cancelAnimationFrame(this.animFrames[idx])
      const tick = () => {
        s.phase += 0.23; s.amp *= 0.965
        if (s.amp < 0.22) { s.vibrating = false; s.amp = 0; this.animFrames[idx] = null; return }
        this.animFrames[idx] = requestAnimationFrame(tick)
      }
      this.animFrames[idx] = requestAnimationFrame(tick)
    },

    async pluck(idx) {
      await this.playString(idx)
      this.startVibration(idx)
      this.lastNote = this.stringsData[idx].note
      clearTimeout(this.noteTimer)
      this.noteTimer = setTimeout(() => { this.lastNote = '' }, 3000)
    },

    /* ─── 弦路径（与 GuitarView 相同，在原始坐标系里生成，随 rotate 一起旋转） ─── */
    getStringPath(idx) {
      const s = this.stringsData[idx]
      const x = s.x, y1 = 141, y2 = 581
      if (!s.vibrating || s.amp < 0.18) return `M ${x},${y1} L ${x},${y2}`
      const midY = (y1 + y2) / 2
      const off = s.amp * Math.sin(s.phase)
      const c1y = y1 + (midY - y1) * 0.44
      const c2y = midY + (y2 - midY) * 0.56
      return `M ${x},${y1} C ${x+off*.62},${c1y} ${x+off},${midY} ${x+off*.62},${c2y} C ${x+off*.28},${c2y+28} ${x},${y2-7} ${x},${y2}`
    },

    /* ─── 坐标转换（横版新增） ─── */
    /*
      viewBox 0 0 760 300
      旋转后：原始 x_orig 对应 y_display = 300 - x_orig
      鼠标 clientY → svgY（0-300）→ 找最近的弦
    */
    getSvgY(clientY) {
      const svg = this.$refs.svg; if (!svg) return 0
      const r = svg.getBoundingClientRect()
      return ((clientY - r.top) / r.height) * 300
    },
    getStringAtY(svgY) {
      const isMobile = window.innerWidth <= 768
      let best = -1, bestD = isMobile ? 22 : 14
      this.stringsData.forEach((s, i) => {
        const yDisplay = 300 - s.x
        const d = Math.abs(svgY - yDisplay)
        if (d < bestD) { bestD = d; best = i }
      })
      return best
    },

    /* ─── 事件处理 ─── */
    onStringDown(i) { this.isDragging = true; this.lastStrumIdx = i; this.pluck(i) },
    onMouseMove(e) {
      if (!this.isDragging) return
      const idx = this.getStringAtY(this.getSvgY(e.clientY))
      if (idx !== -1 && idx !== this.lastStrumIdx) { this.lastStrumIdx = idx; this.pluck(idx) }
    },
    onMouseUp() { this.isDragging = false; this.lastStrumIdx = -1 },
    onStringTouchStart(i) { this.isDragging = true; this.lastStrumIdx = i; this.pluck(i) },
    onTouchMove(e) {
      if (!this.isDragging) return
      const idx = this.getStringAtY(this.getSvgY(e.touches[0].clientY))
      if (idx !== -1 && idx !== this.lastStrumIdx) { this.lastStrumIdx = idx; this.pluck(idx) }
    },
  },
}
</script>

<style scoped>
.gd-wrap {
  width: 100%;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.gd-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
  filter: drop-shadow(0 6px 20px rgba(0,0,0,0.55));
}

/* 音名浮标 */
.gd-note {
  position: absolute;
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Cormorant Garamond', 'Ma Shan Zheng', serif;
  font-size: 1.5rem;
  color: rgba(255,230,120,0.9);
  text-shadow: 0 0 14px rgba(255,200,50,0.4);
  pointer-events: none;
  letter-spacing: 0.06em;
}

.nd-fade-enter-active,
.nd-fade-leave-active { transition: opacity 0.3s; }
.nd-fade-enter-from,
.nd-fade-leave-to     { opacity: 0; }
</style>
