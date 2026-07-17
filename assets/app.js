const groupsRoot = document.querySelector('#groups')
const groupTemplate = document.querySelector('#group-template')
const cardTemplate = document.querySelector('#card-template')
const BING_WALLPAPER_API = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

function useFallbackIcon(image, sources) {
  const [current, ...fallbacks] = sources

  image.src = current
  image.onerror = () => {
    if (!fallbacks.length) {
      image.onerror = null
      return
    }

    useFallbackIcon(image, fallbacks)
  }
}

async function loadLinks() {
  const response = await fetch('./config/links.json')

  if (!response.ok) {
    throw new Error('links.json \u52a0\u8f7d\u5931\u8d25')
  }

  return response.json()
}

async function loadDailyBackground() {
  // Bing 的壁纸元数据接口未开放 CORS；图片本身仍直接从 Bing 加载。
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(BING_WALLPAPER_API)}`)

  if (!response.ok) {
    throw new Error('\u6bcf\u65e5\u58c1\u7eb8\u52a0\u8f7d\u5931\u8d25')
  }

  const { images } = await response.json()
  const imageUrl = images?.[0]?.url

  if (!imageUrl) {
    throw new Error('\u6bcf\u65e5\u58c1\u7eb8\u5730\u5740\u7f3a\u5931')
  }

  document.body.style.setProperty('--background-image', `url(${new URL(imageUrl, 'https://www.bing.com').href})`)
}

function refreshBackgroundAtMidnight() {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 1, 0)

  window.setTimeout(() => {
    loadDailyBackground().catch(() => {})
    refreshBackgroundAtMidnight()
  }, nextMidnight - now)
}

function render(data) {
  document.title = data.title || 'Website Guide'
  groupsRoot.textContent = ''

  data.groups.forEach((group) => {
    const groupNode = groupTemplate.content.cloneNode(true)
    groupNode.querySelector('h2').setAttribute('aria-label', group.title)
    const cards = groupNode.querySelector('.cards')

    group.items.forEach((item) => {
      const cardNode = cardTemplate.content.cloneNode(true)
      const link = cardNode.querySelector('a')
      const image = cardNode.querySelector('img')

      link.href = item.url
      useFallbackIcon(image, item.icon ? [item.icon, './tagfile.ico'] : ['./tagfile.ico'])
      cardNode.querySelector('strong').textContent = item.title
      cardNode.querySelector('small').textContent = item.description || item.url
      cards.append(cardNode)
    })

    groupsRoot.append(groupNode)
  })
}

loadLinks()
  .then(render)
  .catch((error) => {
    groupsRoot.innerHTML = `<p class="error">${error.message}</p>`
  })

loadDailyBackground().catch(() => {})
refreshBackgroundAtMidnight()
