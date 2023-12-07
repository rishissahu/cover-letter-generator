document.addEventListener('DOMContentLoaded', function () {
    const jobDescriptionInput = document.getElementById('job-description');
    const resumeInput = document.getElementById('resume');
    const generateCoverLetterButton = document.getElementById('generate-cover-letter');
    const coverLetterOutput = document.getElementById('cover-letter-output');
    const copyCoverLetterButton = document.getElementById('copy-cover-letter');
    const generating = document.getElementById('genearting')
    generateCoverLetterButton.addEventListener('click', async function () {
        const jobDescription = jobDescriptionInput.value;
        const resumeFile = resumeInput.files[0];

        if (!jobDescription || !resumeFile) {
            alert('Please fill in the job description and upload a resume.');
            return;
        }

        try {
            generateCoverLetterButton.disabled = true;
            const coverLetter = await generateCoverLetter(jobDescription, resumeFile);
            coverLetterOutput.innerText = coverLetter;
        } catch (error) {
            generateCoverLetterButton.disabled = false;
            console.error('Error generating cover letter:', error);
            generating.innerText='Error generating cover letter. Please try again.';
        }
    });

    copyCoverLetterButton.addEventListener('click', function () {
        copyToClipboard(coverLetterOutput.innerText);
    });

    async function generateCoverLetter(jobDescription, resumeFile) {
        const formData = new FormData();
        formData.append('jobDescription', jobDescription);
        formData.append('resume', resumeFile);

        try {
            generating.innerText="Generating please wait (This my take upto 1 min.)"
            const response = await fetch('http://localhost:3000/generate-cover-letter', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                generating.innerText="Failed"
                throw new Error('Server responded with an error.');
            }

            const data = await response.json();
            generating.innerText="Cover letter generated successfully..."
            return data.coverLetter;
        } catch (error) {
            throw error;
        }
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        generating.innerText="Coppied to clipboard!"
    }
});

// document.getElementById('download-cover-letter').addEventListener('click', () => {
//     const coverLetterText = document.getElementById('cover-letter-output').innerText;


//     console.log("cover-letter-output", coverLetterText.length)

//     if (coverLetterText.trim() !== '') {
//         const blob = new Blob([coverLetterText], { type: 'application/pdf' });
//         const link = document.createElement('a');
//         link.href = window.URL.createObjectURL(blob);
//         link.download = 'cover_letter.pdf';
//         link.click();
//     } else {
//         alert('Please generate a cover letter before downloading.');
//     }
// });
