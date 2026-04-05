export const generateMarkdown = (data) => {
  if (!data) return '';

  let markdown = '';

  // Direct string content
  if (typeof data === 'string') {
    return data;
  }

  // PPT slides
  if (data.slides && Array.isArray(data.slides)) {
    data.slides.forEach((slide, idx) => {
      markdown += `## Slide ${idx + 1}: ${slide.title}\n\n`;
      const bullets = Array.isArray(slide.bullets)
        ? slide.bullets.filter(Boolean)
        : [];
      if (bullets.length > 0) {
        bullets.forEach((b) => {
          markdown += `- ${b}\n`;
        });
        markdown += '\n';
      } else if (typeof slide.content === 'string' && slide.content.trim()) {
        markdown += `${slide.content.trim()}\n\n`;
      }
      const notes = slide.speakerNotes || slide.notes;
      if (notes) {
        markdown += `**Speaker Notes:**\n${notes}\n\n`;
      }
      markdown += '---\n\n';
    });
    return markdown;
  }

  // Sections (Reports, Notes)
  if (data.sections && Array.isArray(data.sections)) {
    data.sections.forEach(section => {
      markdown += `## ${section.title}\n\n${section.content}\n\n`;
    });
    return markdown;
  }

  // Questions (Mock Papers, Quizzes)
  if (data.questions && Array.isArray(data.questions)) {
    data.questions.forEach((q, idx) => {
      markdown += `### Q${idx + 1}. ${q.question}\n\n`;
      if (q.answer) {
        markdown += `**Answer:**\n${q.answer}\n\n`;
      }
    });
    return markdown;
  }

  // Revision sheets with units
  if (data.units && Array.isArray(data.units)) {
    data.units.forEach(u => {
      markdown += `## ${u.name}\n\n`;
      if (u.topics && Array.isArray(u.topics)) {
        u.topics.forEach(t => markdown += `- ${t}\n`);
        markdown += '\n';
      }
    });
  }

  // Key points, Formulae, Definitions
  if (data.keyPoints && Array.isArray(data.keyPoints)) {
    markdown += `## Key Points\n\n`;
    data.keyPoints.forEach(p => markdown += `- ${p}\n`);
    markdown += '\n';
  }
  if (data.formulae && Array.isArray(data.formulae)) {
    markdown += `## Formulae\n\n`;
    data.formulae.forEach(f => markdown += `- ${f}\n`);
    markdown += '\n';
  }
  if (data.definitions && Array.isArray(data.definitions)) {
    markdown += `## Definitions\n\n`;
    data.definitions.forEach(d => markdown += `- ${d}\n`);
    markdown += '\n';
  }

  // If we collected some structured data
  if (markdown) return markdown;

  // Fallback
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};

export const downloadAsMarkdown = (contentData, title) => {
  let contentObj = contentData;
  if (typeof contentData === 'string') {
    try {
      contentObj = JSON.parse(contentData);
    } catch (e) {
      // Keep as string
    }
  }

  const markdownStr = `# ${title || 'Document'}\n\n${generateMarkdown(contentObj)}`;
  const blob = new Blob([markdownStr], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Sanitize filename
  const safeFilename = (title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();

  link.href = url;
  link.download = `${safeFilename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
