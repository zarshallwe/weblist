const groupsRoot = document.querySelector('#groups')
const groupTemplate = document.querySelector('#group-template')
const cardTemplate = document.querySelector('#card-template')

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

function render(data) {
  document.title = data.title || 'Website Guide'
  groupsRoot.textContent = ''

  data.groups.forEach((group) => {
    const groupNode = groupTemplate.content.cloneNode(true)
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
