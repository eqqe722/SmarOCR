
import { GoogleGenAI, Type } from "@google/genai";
import { OCRField, OCRTable, DocumentData, OCRTableCell } from '../types.ts';

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const validateFileStructure = async (base64: string, mimeType: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    if (!base64 || base64.length < 100) {
      return { isValid: false, error: "بيانات الملف غير مكتملة أو تالفة." };
    }
    const sizeInMb = (base64.length * (3/4)) / (1024 * 1024);
    if (sizeInMb > 20) {
      return { isValid: false, error: `حجم الملف (${sizeInMb.toFixed(1)}MB) يتجاوز الحد الأقصى للمعالجة.` };
    }
    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: "خطأ غير متوقع في فحص الملف." };
  }
};

const mapGeminiError = (error: any): string => {
  const message = error?.message || "";
  if (message.includes("400")) return "فشل في هيكلة البيانات. يرجى التأكد من أن المستند غير مشفر ومقروء.";
  if (message.includes("429")) return "تجاوز حدود الاستخدام المسموح بها. يرجى المحاولة بعد لحظات.";
  return "فشل المحرك الذكي Gemini في تحليل الوثيقة. تأكد من جودة الصورة.";
};

export const processDocumentWithAI = async (
  base64Data: string,
  mimeType: string,
  fileName: string
): Promise<DocumentData> => {
  const validation = await validateFileStructure(base64Data, mimeType);
  if (!validation.isValid) throw new Error(validation.error);

  const ai = getAIClient();
  const modelName = 'gemini-3-pro-preview'; 
  
  const prompt = `
    أنت محلل بيانات استراتيجي متخصص في المستندات الحكومية العربية. 
    قم بتحليل الوثيقة المرفقة بدقة فائقة وفق القواعد التالية:
    1. استخراج الحقول: استخرج كافة الحقول الجوهرية (رقم الكتاب، التاريخ، الجهة، الموضوع).
    2. الجداول: المستند عربي (RTL). اتبع الترتيب المنطقي للأعمدة من اليمين إلى اليسار.
    3. الدقة: حدد إحداثيات كل حقل 'box_2d' بدقة [ymin, xmin, ymax, xmax] (من 0 لـ 1000).
    4. الكيانات: تعرف على التواقيع والأختام وحدد حالتها.
    
    يجب أن يكون الرد بصيغة JSON حصراً وبناءً على المخطط المقدم.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patternId: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["string", "number", "date", "currency", "email"] },
                  confidence: { type: Type.NUMBER },
                  box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "[ymin, xmin, ymax, xmax]" }
                },
                required: ["name", "value", "type"]
              }
            },
            tables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          value: { type: Type.STRING },
                          rowSpan: { type: Type.INTEGER },
                          colSpan: { type: Type.INTEGER }
                        },
                        required: ["value"]
                      }
                    }
                  }
                },
                required: ["name", "headers", "rows"]
              }
            }
          },
          required: ["fields", "tables", "category", "summary"]
        }
      }
    });

    const rawResult = JSON.parse(response.text || '{}');

    return {
      id: Math.random().toString(36).substr(2, 9),
      fileName,
      status: 'completed',
      timestamp: new Date().toISOString(),
      fileType: mimeType,
      patternId: rawResult.patternId,
      priority: rawResult.priority || 'medium',
      fields: (rawResult.fields || []).map((f: any) => ({ 
        ...f, 
        id: Math.random().toString(36).substr(2, 9), 
        isMandatory: true 
      })),
      tables: (rawResult.tables || []).map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: t.name,
        headers: t.headers,
        rows: (t.rows || []).map((r: any[]) => r.map(c => ({ 
          value: String(c.value || ''), 
          rowSpan: c.rowSpan || 1, 
          colSpan: c.colSpan || 1 
        })))
      })),
      category: rawResult.category,
      summary: rawResult.summary
    };
  } catch (error: any) {
    throw new Error(mapGeminiError(error));
  }
};

export const cleanDataWithAI = async (fields: OCRField[]): Promise<OCRField[]> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بصفتك مصححاً لغوياً خبيراً، قم بتدقيق وتنقية هذه البيانات واستبدال أي رموز غير واضحة بنصوص صحيحة: ${JSON.stringify(fields)}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              type: { type: Type.STRING },
              isMandatory: { type: Type.BOOLEAN },
              box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } }
            },
            required: ["id", "name", "value"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return fields;
  }
};

export const semanticSearchAI = async (query: string, documents: any[]): Promise<any[]> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `قم بالبحث عن المفاهيم المرتبطة بـ "${query}" في هذه الوثائق: ${JSON.stringify(documents.map(d => ({id: d.id, summary: d.summary, fileName: d.fileName})))}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              docId: { type: Type.STRING },
              fileName: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              snippet: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};
