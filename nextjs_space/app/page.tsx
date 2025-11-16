'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Check, Calendar, DollarSign, Users, BarChart3, Package, Globe, 
  Shield, X, CheckCircle2, Star, ChevronDown, Wrench 
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)

  useEffect(() => {
    if (session) {
      router.replace('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0099FF]"></div>
      </div>
    )
  }

  if (session) {
    return null
  }

  // Dados estruturados conforme o prompt
  const problemas = [
    'Agenda no WhatsApp',
    'Cliente esquecendo horário',
    'Falta de controle financeiro',
    'Controle de estoque inexistente',
    'Comissões feitas no papel',
    'Falta de página profissional',
    'Desorganização geral'
  ]

  const solucoes = [
    'Agenda inteligente',
    'Link público de agendamento',
    'Relatórios e caixa automático',
    'Controle de estoque',
    'Comissões automáticas',
    'Página pública profissional',
    'Tudo em um só painel'
  ]

  const funcionalidades = [
    {
      icon: Calendar,
      title: 'Agenda Online Inteligente',
      description: 'Organize horários, profissionais e serviços em um só lugar'
    },
    {
      icon: Globe,
      title: 'Link Público de Agendamento',
      description: 'Seus clientes agendam direto no seu site profissional'
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro Automático',
      description: 'Receitas, despesas e lucro calculados em tempo real'
    },
    {
      icon: Users,
      title: 'Comissões de Profissionais',
      description: 'Cálculo automático e transparente para sua equipe'
    },
    {
      icon: Package,
      title: 'Controle de Estoque',
      description: 'Gerencie produtos e movimentações facilmente'
    },
    {
      icon: BarChart3,
      title: 'Página Web Profissional do Salão',
      description: 'Site grátis com agendamento online para seus clientes'
    }
  ]

  const depoimentos = [
    {
      nome: 'Carla Mendes',
      negocio: 'Salão Glamour',
      foto: 'C',
      texto: 'Antes era tudo bagunçado no caderno. Agora tenho controle total e meus clientes adoram agendar pelo site!',
      metrica: '+ 1.200 agendamentos gerados'
    },
    {
      nome: 'Paulo Ricardo',
      negocio: 'Barbearia Premium',
      foto: 'P',
      texto: 'O sistema pagou-se em 1 semana. Economizo horas todo dia e não perco mais clientes por desorganização.',
      metrica: '4x mais produtividade'
    },
    {
      nome: 'Juliana Costa',
      negocio: 'Estética Bella Vita',
      foto: 'J',
      texto: 'Simples, rápido e completo. Comecei a usar em 10 minutos e nunca mais parei. Recomendo!',
      metrica: 'ROI positivo em 1 semana'
    }
  ]

  const planos = [
    {
      nome: 'Básico',
      preco: 39.90,
      descricao: 'Para profissionais autônomos',
      recursos: [
        'Agenda online inteligente',
        'Link público de agendamento',
        'Controle financeiro básico',
        'Página web profissional',
        'Até 2 profissionais',
        'Suporte via WhatsApp'
      ],
      destaque: false
    },
    {
      nome: 'Intermediário',
      preco: 49.90,
      descricao: 'Para salões com pequena equipe',
      recursos: [
        'Tudo do plano Básico',
        'Controle de comissões',
        'Gestão de estoque completa',
        'Relatórios avançados',
        'Até 6 profissionais',
        'Suporte prioritário'
      ],
      destaque: true
    },
    {
      nome: 'Completo',
      preco: 99.90,
      descricao: 'Para operações maiores',
      recursos: [
        'Tudo do plano Intermediário',
        'Profissionais ilimitados',
        'Múltiplas unidades',
        'Relatórios personalizados',
        'API de integração',
        'Suporte VIP 24/7'
      ],
      destaque: false
    }
  ]

  const faqs = [
    {
      pergunta: 'Preciso instalar algo?',
      resposta: 'Não! O Sistema Beleza funciona 100% online. Basta acessar pelo navegador de qualquer dispositivo.'
    },
    {
      pergunta: 'Funciona no celular?',
      resposta: 'Sim! O sistema é totalmente responsivo e funciona perfeitamente em celulares, tablets e computadores.'
    },
    {
      pergunta: 'Quantos profissionais posso cadastrar?',
      resposta: 'Depende do plano: Básico (2), Intermediário (6) ou Completo (ilimitado). Você pode mudar de plano a qualquer momento.'
    },
    {
      pergunta: 'Tem controle de estoque?',
      resposta: 'Sim! Os planos Intermediário e Completo incluem controle completo de estoque com entradas, saídas e alertas.'
    },
    {
      pergunta: 'Tenho página profissional do salão?',
      resposta: 'Sim! Todos os planos incluem uma página web profissional onde seus clientes podem agendar online 24/7.'
    },
    {
      pergunta: 'Preciso de cartão para testar?',
      resposta: 'Não! O teste de 30 dias é totalmente gratuito e não requer cartão de crédito. Só cobramos se você decidir continuar.'
    },
    {
      pergunta: 'Posso colocar o link no Instagram?',
      resposta: 'Sim! Você pode compartilhar o link da sua página de agendamento no Instagram, Facebook, WhatsApp e onde quiser.'
    },
    {
      pergunta: 'E se eu desistir após o teste?',
      resposta: 'Sem problema! Você pode cancelar a qualquer momento, sem multas ou taxas. Seus dados ficam salvos por 90 dias.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo-sistema-beleza.png"
                  alt="Sistema Beleza"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-[#333333]">Sistema Beleza</span>
            </Link>

            {/* CTA Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="px-5 py-2 text-[#333333] hover:text-[#0099FF] font-medium transition"
              >
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-3 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0088EE] transition shadow-sm"
              >
                Criar conta – 30 dias grátis
              </Link>
            </div>

            {/* CTA Mobile */}
            <div className="md:hidden">
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full text-sm"
              >
                Teste Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="bg-white py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#333333] mb-6 leading-tight">
              Organize seu salão em 10 minutos.
              <span className="block text-[#0099FF] mt-2">Cresça para sempre.</span>
            </h1>

            {/* Subtítulo */}
            <h2 className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Agenda, agendamento online, controle financeiro, comissões, estoque e página profissional — tudo em um sistema simples e rápido.
            </h2>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-4 bg-[#0099FF] text-white font-bold rounded-full hover:bg-[#0088EE] transition shadow-lg text-lg"
              >
                Criar conta – 30 dias grátis
              </Link>
              <a
                href="#funcionalidades"
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#333333] font-semibold rounded-full border-2 border-gray-300 hover:border-[#0099FF] transition text-lg"
              >
                Ver como funciona
              </a>
            </div>

            {/* Mockup/Print do Sistema */}
            <div className="relative mt-12">
              <div className="relative w-full max-w-4xl mx-auto aspect-video bg-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Calendar className="w-16 h-16 text-[#0099FF] mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Interface do Sistema Beleza</p>
                    <p className="text-sm text-gray-400 mt-2">Agenda • Financeiro • Controle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEMAS x SOLUÇÕES */}
      <section className="bg-[#f5f5f5] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] text-center mb-12">
              Dores comuns vs. Soluções reais
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Problemas */}
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#333333]">Antes</h3>
                </div>
                <ul className="space-y-4">
                  {problemas.map((problema, index) => (
                    <li key={index} className="flex items-start">
                      <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{problema}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Soluções */}
              <div className="bg-[#0099FF] p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                    <CheckCircle2 className="w-6 h-6 text-[#0099FF]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Com Sistema Beleza</h3>
                </div>
                <ul className="space-y-4">
                  {solucoes.map((solucao, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">{solucao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FUNCIONALIDADES (6 cards) */}
      <section id="funcionalidades" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
                Funcionalidades que transformam seu negócio
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tudo que você precisa para gerenciar seu salão de forma profissional
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funcionalidades.map((func, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#0099FF] hover:shadow-lg transition group"
                >
                  <div className="w-12 h-12 bg-[#0099FF]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#0099FF] transition">
                    <func.icon className="w-6 h-6 text-[#0099FF] group-hover:text-white transition" />
                  </div>
                  <h3 className="text-lg font-bold text-[#333333] mb-2">
                    {func.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {func.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRINTS DO SISTEMA (Mockups) */}
      <section className="bg-[#f5f5f5] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
                Veja o sistema em ação
              </h2>
              <p className="text-lg text-gray-600">
                Interface moderna, intuitiva e fácil de usar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Print 1 - Agenda */}
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <Calendar className="w-12 h-12 text-[#0099FF] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Agenda Inteligente</p>
                  </div>
                </div>
              </div>

              {/* Print 2 - Financeiro */}
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Controle Financeiro</p>
                  </div>
                </div>
              </div>

              {/* Print 3 - Estoque */}
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <Package className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Gestão de Estoque</p>
                  </div>
                </div>
              </div>

              {/* Print 4 - Página Pública */}
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <Globe className="w-12 h-12 text-pink-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">Página Profissional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROVA SOCIAL (Depoimentos) */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
                Quem usa, recomenda
              </h2>
              <p className="text-lg text-gray-600">
                Veja o que nossos clientes estão dizendo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {depoimentos.map((depoimento, index) => (
                <div
                  key={index}
                  className="bg-[#f5f5f5] p-6 rounded-xl hover:shadow-lg transition"
                >
                  {/* Estrelas */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Depoimento */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{depoimento.texto}"
                  </p>

                  {/* Autor */}
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-[#0099FF] text-white rounded-full flex items-center justify-center font-bold text-lg mr-3">
                      {depoimento.foto}
                    </div>
                    <div>
                      <p className="font-bold text-[#333333]">{depoimento.nome}</p>
                      <p className="text-sm text-gray-600">{depoimento.negocio}</p>
                    </div>
                  </div>

                  {/* Métrica */}
                  {depoimento.metrica && (
                    <div className="pt-3 border-t border-gray-300">
                      <p className="text-sm font-semibold text-[#0099FF]">
                        {depoimento.metrica}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLANOS E PREÇOS */}
      <section id="planos" className="bg-[#f5f5f5] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
                Planos transparentes e flexíveis
              </h2>
              <p className="text-lg text-gray-600">
                30 dias grátis em todos os planos • Sem cartão de crédito
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {planos.map((plano, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-8 ${
                    plano.destaque
                      ? 'ring-2 ring-[#0099FF] shadow-2xl scale-105'
                      : 'border border-gray-200 shadow-sm'
                  }`}
                >
                  {/* Badge */}
                  {plano.destaque && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#0099FF] text-white px-4 py-1 rounded-full text-sm font-bold">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Cabeçalho */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#333333] mb-2">
                      {plano.nome}
                    </h3>
                    <p className="text-sm text-gray-600">{plano.descricao}</p>
                  </div>

                  {/* Preço */}
                  <div className="mb-6">
                    <div className="flex items-end mb-2">
                      <span className="text-5xl font-bold text-[#333333]">
                        R$ {plano.preco.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-gray-600 ml-2">/mês</span>
                    </div>
                  </div>

                  {/* Recursos */}
                  <ul className="space-y-3 mb-8">
                    {plano.recursos.map((recurso, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-[#0099FF] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{recurso}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/auth/signup"
                    className={`block w-full py-3 rounded-full font-semibold text-center transition ${
                      plano.destaque
                        ? 'bg-[#0099FF] text-white hover:bg-[#0088EE] shadow-md'
                        : 'bg-gray-100 text-[#333333] hover:bg-gray-200'
                    }`}
                  >
                    Começar teste grátis
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. GARANTIAS E SEGURANÇA */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] text-center mb-12">
              Experimente sem riscos
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Garantia 1 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#0099FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#0099FF]" />
                </div>
                <h3 className="font-bold text-[#333333] mb-2">Sem cartão para testar</h3>
                <p className="text-sm text-gray-600">30 dias 100% grátis</p>
              </div>

              {/* Garantia 2 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#0099FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-[#0099FF]" />
                </div>
                <h3 className="font-bold text-[#333333] mb-2">Cancele quando quiser</h3>
                <p className="text-sm text-gray-600">Sem multas ou taxas</p>
              </div>

              {/* Garantia 3 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#0099FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#0099FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-[#333333] mb-2">Suporte via WhatsApp</h3>
                <p className="text-sm text-gray-600">Atendimento rápido</p>
              </div>

              {/* Garantia 4 */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#0099FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#0099FF]" />
                </div>
                <h3 className="font-bold text-[#333333] mb-2">Dados 100% seguros</h3>
                <p className="text-sm text-gray-600">Certificado SSL e LGPD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="bg-[#f5f5f5] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-gray-600">
                Tire suas dúvidas sobre o Sistema Beleza
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-[#333333] pr-4">
                      {faq.pergunta}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#0099FF] flex-shrink-0 transition-transform ${
                        activeQuestion === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {activeQuestion === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.resposta}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL */}
      <section className="bg-[#0099FF] py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Seu salão organizado. Seu tempo de volta.
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Comece agora e transforme a gestão do seu negócio em 10 minutos
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-12 py-5 bg-white text-[#0099FF] font-bold rounded-full hover:shadow-2xl transition text-lg"
            >
              Criar conta grátis agora
            </Link>
            <p className="mt-6 text-sm opacity-75">
              Sem cartão • 30 dias grátis • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#333333] text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Sobre */}
            <div>
              <h3 className="font-bold text-lg mb-4">Sistema Beleza</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Gestão profissional para salões de beleza, barbearias e clínicas estéticas.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-5 h-5 text-green-500" />
                <span>SSL • LGPD</span>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>(27) 99776-3546</li>
                <li>contato@sistemabeleza.com.br</li>
                <li className="pt-2">
                  Av. Antônio Gil Veloso, 1818<br />
                  Vila Velha - ES
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Acesso Rápido</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/auth/login" className="hover:text-white transition">
                    Entrar no sistema
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition">
                    Criar conta grátis
                  </Link>
                </li>
                <li className="pt-4">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Painel Admin</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Sistema Beleza. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Botão WhatsApp Flutuante */}
      <a
        href="https://wa.me/5527997763546?text=Olá! Gostaria de saber mais sobre o Sistema Beleza"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 z-50"
        aria-label="Falar no WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  )
}