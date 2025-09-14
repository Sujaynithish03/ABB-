import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PromptGuide() {
  const examples = [
    {
      category: "Text Responses",
      examples: [
        "What is a PLC?",
        "Explain the difference between NO and NC contacts",
        "How does a timer work in ladder logic?"
      ]
    },
    {
      category: "Ladder Diagrams",
      examples: [
        "Show me a ladder diagram for a start/stop motor control",
        "Create a ladder diagram for a traffic light system",
        "Draw a ladder diagram with a timer and counter"
      ]
    },
    {
      category: "PLC Code",
      examples: [
        "Write PLC code for a conveyor belt control",
        "Generate structured text for a temperature controller",
        "Show me function block code for a PID controller"
      ]
    },
    {
      category: "Complete Solutions",
      examples: [
        "Explain and show a timer implementation with code and ladder",
        "Create a motor control system with explanation, ladder diagram, and PLC code",
        "Design a safety circuit with documentation and implementation"
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">IEC 61131-3 Assistant Guide</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {examples.map((category, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-sm">{category.category}</CardTitle>
              <CardDescription className="text-xs">
                {category.category === "Text Responses" && "Ask general questions about PLC programming"}
                {category.category === "Ladder Diagrams" && "Request ladder diagrams for specific applications"}
                {category.category === "PLC Code" && "Get structured text or function block code"}
                {category.category === "Complete Solutions" && "Get explanation + diagram + code in one response"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.examples.map((example, i) => (
                  <div key={i} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    "{example}"
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <p><strong>Tip:</strong> Be specific in your requests. The assistant will respond with exactly what you ask for.</p>
      </div>
    </div>
  );
}
