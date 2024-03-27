// script.js
const urlForm = document.getElementById('urlForm')
const urlInput = document.getElementById('urlInput')
const codeInput = document.getElementById('codeInput')
const resultDiv = document.getElementById('result')

urlForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const url = urlInput.value
    const code = codeInput.value

    try {
        const response = await fetch('/api/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, code })
        })

        if (response.status === 201) {
            const shortenedUrl = `${window.location.origin}/code/${code}`
            resultDiv.innerText = `Shortened URL: ${shortenedUrl}`
        } else {
            resultDiv.innerText = 'An error occurred. Please try again.'
        }

    } catch (error) {
        console.error('Error:', error)
        resultDiv.innerText = 'An error occurred. Please try again.'
    }
})
