document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const instructionsTableContainer = document.getElementById('instructionsTableContainer');
    const instructionsTableBody = document.querySelector('#instructionsTable tbody');

    let instructions = [];

    const fetchInstructionFiles = async () => {
        const response = await fetch('instructions/1_instructions.json');
        const instructionFiles = await response.json();
        return instructionFiles;
    };

    const fetchInstructionData = async (fileName) => {
        const response = await fetch(`instructions/${fileName}`);
        const data = await response.json();
        return data;
    };

    const loadInstructions = async () => {
        const instructionFiles = await fetchInstructionFiles();
        const instructions = [];

        for (const file of instructionFiles) {
            const instruction = await fetchInstructionData(file);
            instructions.push(instruction);
        }

        return instructions;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Instructions copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const displayInstructions = (instructions, searchTerm) => {
        instructionsTableBody.innerHTML = '';
        let hasResults = false;
        const searchTerms = searchTerm.split(' ').filter(term => term.trim() !== '');

        instructions.forEach(instruction => {
            const nameAndObjective = `${instruction.name.toLowerCase()} ${instruction.objective.toLowerCase()}`;
            const isMatch = searchTerms.every(term => nameAndObjective.includes(term));

            if (isMatch) {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = instruction.name;

                const detailsCell = document.createElement('td');
                const instructionText = `
                    Objective: ${instruction.objective}\n
                    ${instruction.content}
                `;
                detailsCell.innerHTML = instructionText.replace(/\n/g, '<br>');

                row.appendChild(nameCell);
                row.appendChild(detailsCell);
                instructionsTableBody.appendChild(row);

                detailsCell.addEventListener('dblclick', () => {
                    copyToClipboard(instructionText);
                    detailsCell.classList.add('copied');
                    setTimeout(() => {
                        detailsCell.classList.add('hide-tooltip');
                    }, 1500); // Remove the tooltip after 1.5 seconds
                    setTimeout(() => {
                        detailsCell.classList.remove('copied');
                        detailsCell.classList.remove('hide-tooltip');
                    }, 2000); // Remove the highlight and tooltip after 2 seconds
                });

                hasResults = true;
            }
        });

        instructionsTableContainer.style.display = hasResults ? 'block' : 'none';
    };

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.trim() === '') {
            instructionsTableContainer.style.display = 'none';
            instructionsTableBody.innerHTML = '';
            return;
        }
        displayInstructions(instructions, searchTerm);
    });

    // Load instructions on page load
    (async () => {
        instructions = await loadInstructions();
    })();
});