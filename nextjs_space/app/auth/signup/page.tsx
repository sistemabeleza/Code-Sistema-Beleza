'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scissors, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nomeSalao: '',
    nomeUsuario: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.nomeSalao || !formData.nomeUsuario || !formData.email || !formData.senha) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      // Criar conta
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeSalao: formData.nomeSalao,
          nome: formData.nomeUsuario,
          email: formData.email,
          senha: formData.senha
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao criar conta')
        setIsLoading(false)
        return
      }

      // Fazer login automaticamente
      toast.success('Conta criada com sucesso! Entrando...')
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.senha,
        redirect: false
      })

      if (result?.error) {
        toast.error('Conta criada, mas erro ao fazer login. Tente fazer login manualmente.')
        router.push('/auth/login')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-[90%] sm:max-w-md shadow-xl">
        <CardHeader className="space-y-3 px-4 sm:px-6">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl text-center font-bold">Criar Conta</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Crie sua conta e comece a gerenciar seu salão em minutos
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeSalao" className="text-sm sm:text-base">Nome do Salão</Label>
              <Input
                id="nomeSalao"
                name="nomeSalao"
                placeholder="Ex: Salão Beleza Premium"
                value={formData.nomeSalao}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeUsuario" className="text-sm sm:text-base">Seu Nome</Label>
              <Input
                id="nomeUsuario"
                name="nomeUsuario"
                placeholder="Ex: Maria Silva"
                value={formData.nomeUsuario}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm sm:text-base">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-sm sm:text-base">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="h-11 sm:h-12 text-sm sm:text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base font-medium mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta Grátis'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Já tem uma conta? </span>
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
