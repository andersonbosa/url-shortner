// script.js
const urlForm = document.getElementById('urlForm')
const urlInput = document.getElementById('urlInput')
const codeInput = document.getElementById('codeInput')
const resultDiv = document.getElementById('result')

const createAnchorTag = (href) => {
  const anchorTag = document.createElement('a')
  anchorTag.setAttribute('href', href)
  anchorTag.setAttribute('target', '_blank')
  anchorTag.innerText = `${href}`
  // // Limpar o conteúdo anterior e adicionar o novo link âncora ao resultado
  // resultDiv.innerHTML = '';
  // resultDiv.appendChild(anchorTag);
  return anchorTag
}

urlForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const url = urlInput.value
  const code = codeInput.value

  const payload = { url }
  if (code) payload.code = code

  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    const jsonResponse = await response.json()
    if (response.status === 201) {
      const shortenedUrl = `${window.location.origin}/code/${jsonResponse.code}`
      
      const anchorTag = createAnchorTag(shortenedUrl)

      p = document.createElement('p')
      p.innerText = 'Short link created:'

      resultDiv.innerHTML = ''
      resultDiv.appendChild(p)
      resultDiv.appendChild(anchorTag)

      resultDiv.classList.remove('invisible')
    } else {
      resultDiv.innerText = 'An error occurred. Please try again.'
      resultDiv.classList.remove('invisible')
    }

  } catch (error) {
    console.error('Error:', error)
    resultDiv.innerText = 'An error occurred. Please try again.'
  }
})
