'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Calendar, DollarSign, Users, BarChart3, Package, FileText, CheckCircle, Clock, Shield, Award } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  })

  useEffect(() => {
    if (session) {
      router.replace('/dashboard')
    }
  }, [session, router])
  
  // Timer falso
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (session) {
    return null // Redirect will handle navigation
  }

  const plans = [
    {
      name: 'Básico',
      price: 39.90,
      professionals: '2 profissionais',
      features: [
        'Agenda online completa',
        'Controle financeiro básico',
        'Cadastro de clientes',
        'Site grátis incluso',
        'Relatórios semanais',
        'Suporte por email'
      ],
      highlighted: false
    },
    {
      name: 'Intermediário',
      price: 49.90,
      professionals: '6 profissionais',
      features: [
        'Tudo do plano Básico',
        'Gestão de produtos/estoque',
        'Controle de comissões',
        'Relatórios avançados',
        'Site personalizado grátis',
        'Suporte prioritário'
      ],
      highlighted: true
    },
    {
      name: 'Completo',
      price: 99.90,
      professionals: 'Profissionais ilimitados',
      features: [
        'Tudo do plano Intermediário',
        'Profissionais ilimitados',
        'Múltiplas unidades',
        'API de integração',
        'Relatórios personalizados',
        'Suporte VIP 24/7'
      ],
      highlighted: false
    }
  ]

  const features = [
    {
      icon: Calendar,
      title: 'Agenda Online',
      description: 'Controle total de agendamentos com visualização por profissional e horário'
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro',
      description: 'Acompanhe receitas, despesas e lucros em tempo real'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastro completo com histórico de serviços e preferências'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Inteligentes',
      description: 'Análises detalhadas para decisões estratégicas'
    },
    {
      icon: Package,
      title: 'Controle de Estoque',
      description: 'Gerencie produtos, entradas e saídas automaticamente'
    },
    {
      icon: FileText,
      title: 'Lançamento Automático',
      description: 'Serviços concluídos viram receita automaticamente'
    }
  ]

  const testimonials = [
    {
      name: 'Maria Silva',
      business: 'Salão Elegância',
      text: 'Revolucionou minha gestão! Agora tenho controle total sobre agendamentos e finanças.',
      image: '/testimonial-1.jpg'
    },
    {
      name: 'João Santos',
      business: 'Barbearia Premium',
      text: 'O melhor investimento que fiz. Meus clientes adoram o site grátis para agendar online!',
      image: '/testimonial-2.jpg'
    },
    {
      name: 'Ana Costa',
      business: 'Clínica Estética Bella',
      text: 'Sistema completo e intuitivo. Economizo horas de trabalho todos os dias!',
      image: '/testimonial-3.jpg'
    }
  ]

  const faqs = [
    {
      q: 'Como funciona o teste grátis de 30 dias?',
      a: 'Você se cadastra, escolhe seu plano e tem 30 dias completos para testar todas as funcionalidades sem precisar cadastrar cartão de crédito. Só cobramos após o período de teste, se você decidir continuar.'
    },
    {
      q: 'O site grátis está incluso em todos os planos?',
      a: 'Sim! Todos os planos incluem um site responsivo e profissional onde seus clientes podem agendar serviços online 24/7, sem necessidade de app.'
    },
    {
      q: 'Preciso instalar algum aplicativo?',
      a: 'Não! O Sistema Beleza funciona 100% online pelo navegador. Acesse de qualquer dispositivo, a qualquer hora, sem instalações.'
    },
    {
      q: 'Posso cancelar a qualquer momento?',
      a: 'Sim, sem burocracia. Você pode cancelar seu plano quando quiser, sem multas ou taxas adicionais.'
    },
    {
      q: 'Como funciona o suporte?',
      a: 'Oferecemos suporte por email, WhatsApp e chat. No plano Completo, você tem suporte VIP prioritário 24/7.'
    },
    {
      q: 'Meus dados estão seguros?',
      a: 'Absolutamente! Usamos criptografia SSL, backups automáticos diários e seguimos todas as normas da LGPD para proteção de dados.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo-sistema-beleza.png"
                  alt="Logo Sistema Beleza - Software de gestão"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-bold text-gray-900">Sistema Beleza</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#funcionalidades" className="text-gray-600 hover:text-gray-900 transition">Funcionalidades</a>
              <a href="#planos" className="text-gray-600 hover:text-gray-900 transition">Planos</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-gray-900 transition">Depoimentos</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition">FAQ</a>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all font-medium"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Award className="w-4 h-4" />
              <span>Teste grátis por 30 dias • Sem cartão de crédito</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Gestão Profissional para
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                Salões de Beleza
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema completo de agendamento, financeiro e gestão.
              <span className="block mt-2 font-semibold text-purple-600">
                + Site Grátis para Agendamento Online!
              </span>
            </p>

            {/* Timer de Urgência */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 mb-8 max-w-2xl mx-auto shadow-xl">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">Oferta Especial Expira em:</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-3xl md:text-4xl font-bold">
                <div className="bg-white/20 px-4 py-3 rounded-lg backdrop-blur">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <div className="text-xs font-normal">Horas</div>
                </div>
                <span>:</span>
                <div className="bg-white/20 px-4 py-3 rounded-lg backdrop-blur">
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <div className="text-xs font-normal">Minutos</div>
                </div>
                <span>:</span>
                <div className="bg-white/20 px-4 py-3 rounded-lg backdrop-blur">
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <div className="text-xs font-normal">Segundos</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-2xl transition-all font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Começar Teste Grátis</span>
                <CheckCircle className="w-5 h-5" />
              </Link>
              <Link
                href="https://wa.me/5527997763546?text=Olá! Gostaria de saber mais sobre o Sistema Beleza"
                target="_blank"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full hover:shadow-lg transition-all font-semibold text-lg border-2 border-gray-200"
              >
                Falar com Consultor
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>30 dias grátis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Site grátis incluso</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistema completo e intuitivo, sem necessidade de app. Acesse de qualquer lugar!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-5">
                  <feature.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todos os planos incluem 30 dias grátis e site para agendamento online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    MAIS POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className={`text-sm font-medium ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                    {plan.professionals}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-end">
                    <span className="text-5xl font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                    <span className={`ml-2 ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>/mês</span>
                  </div>
                  <div className={`text-sm mt-2 ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                    30 dias grátis • Sem cartão
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                      <span className={plan.highlighted ? 'text-white/90' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/signup"
                  className={`block w-full py-4 rounded-full font-semibold text-center transition-all ${
                    plan.highlighted
                      ? 'bg-white text-purple-600 hover:shadow-xl'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}
                >
                  Começar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Quem usa, aprova!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja o que nossos clientes dizem sobre o Sistema Beleza
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tire suas dúvidas sobre o Sistema Beleza
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-lg">
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 text-purple-600">+</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Comece agora seu teste grátis de 30 dias e ganhe seu site profissional!
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-5 bg-white text-purple-600 rounded-full hover:shadow-2xl transition-all font-bold text-lg"
          >
            Começar Teste Grátis Agora
          </Link>
          <p className="mt-6 text-white/80">Sem cartão • Sem compromisso • Cancele quando quiser</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo e Descrição */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <span className="text-2xl font-bold">Sistema Beleza</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Software completo de gestão para salões de beleza, barbearias e clínicas de estética.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Certificado SSL • Dados protegidos pela LGPD</span>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contato</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="tel:27997763546" className="hover:text-white transition">
                    (27) 99776-3546
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@sistemabeleza.com.br" className="hover:text-white transition">
                    contato@sistemabeleza.com.br
                  </a>
                </li>
                <li className="text-sm">
                  Av. Antônio Gil Veloso, 1818<br />
                  Praia da Costa, Vila Velha - ES
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-lg mb-4">Empresa</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>CNPJ: 37.051.246/0010-00</li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition">
                    Acessar Sistema
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition">
                    Criar Conta
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Sistema Beleza. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante WhatsApp */}
      <a
        href="https://wa.me/5527997763546?text=Olá! Gostaria de saber mais sobre o Sistema Beleza"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Falar no WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  )
}